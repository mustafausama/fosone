const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const User = require("../../models/User");
const Role = require("../../models/Role");
const UserToken = require("../../models/UserToken");
const findExistingUser = (req, res, next) => {
  const { username, email } = req.body;
  User.findOne({ $or: [{ email }, { username }] })
    .then((user) => {
      if (user)
        return res
          .status(400)
          .json(
            user.username === username
              ? { username: "Username Exists" }
              : { email: "Email exists" }
          );
      next();
    })
    .catch((err) => {
      console.log(err);
      return res.status(500);
    });
};

const findNewUserRole = (req, res, next) => {
  Role.findOne({ name: "NEW_USER" })
    .then((role) => {
      if (!role)
        return res
          .status(500)
          .json({ site: "Registration is not available yet" });
      req.body.newUserRole = role.id;
      next();
    })
    .catch((err) => {
      console.log(err);
      return res.status(500);
    });
};

const hashPassword = (req, res, next) => {
  bcrypt
    .genSalt(10)
    .then((salt) => {
      bcrypt
        .hash(req.body.password, salt)
        .then((hash) => {
          req.body.password = hash;
          next();
        })
        .catch((err) => {
          console.log(err);
          return res.status(500);
        });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500);
    });
};

const saveNewUser = (req, res, next) => {
  const {
    firstName,
    lastName,
    username,
    phone,
    email,
    password,
    country,
    birthdate,
    newUserRole,
  } = req.body;

  const newUser = new User({
    name: firstName.concat(" ").concat(lastName),
    username,
    phone,
    email,
    password,
    country,
    role: newUserRole,
    birthdate,
  });
  newUser
    .save()
    .then((user) => {
      const activationKey = uuidv4();
      const newUserToken = new UserToken({
        user: user.id,
        token: activationKey,
        for: "activation",
      });
      newUserToken
        .save()
        .then((token) => res.status(200).json(user))
        .catch((err) => {
          console.log(err);
          return res.status(500);
        });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500);
    });
};

const findActivationToken = (req, res, next) => {
  require("mongoose").set("useFindAndModify", false);
  UserToken.findOneAndRemove(
    { token: req.params.activationKey, for: "activation" },
    { useFindAndModify: false }
  )
    .then((userToken) => {
      if (!userToken)
        return res
          .status(400)
          .json({ activationKey: "Invalid activation key" });
      req.userToken = userToken;
      next();
    })
    .catch((err) => {
      console.log(err);
      return res.status(500);
    });
};

const activateByActivationKey = (req, res, next) => {
  User.findByIdAndUpdate(req.userToken.user, { activated: true })
    .then((user) => {
      res.status(200).json(user);
    })
    .catch((err) => {
      console.log(err);
      return res.status(500);
    });
};

module.exports = {
  findExistingUser,
  findNewUserRole,
  hashPassword,
  saveNewUser,
  findActivationToken,
  activateByActivationKey,
};
