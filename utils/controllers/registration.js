const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const nodemailer = require("nodemailer");

const User = require("../../models/User");
const Role = require("../../models/Role");
const UserToken = require("../../models/UserToken");

const emailAuth = require("../../config/keys").email;

require("mongoose").set("useFindAndModify", false);

const findExistingUser = (req, res, next) => {
  const { username, email, phone, fbUserID } = req.body;
  const opts = [];
  if (username) opts.push({ username });
  if (email) opts.push({ email });
  if (phone) opts.push({ phone });
  if (fbUserID) opts.push({ "facebook.id": fbUserID });
  User.findOne({
    $or: opts,
  })
    .then((user) => {
      if (user) {
        const error = {};
        if (user.username === username) error.username = "Username Exists";
        if (email && user.email === email) error.email = "Email exists";
        if (phone && user.phone === phone) error.phone = "Phone number exists";
        if (fbUserID && user.facebook.id === fbUserID)
          error.facebook = "Facebook account exists";
        return res.status(400).json(error);
      }
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
  if (req.body.fbUserID && !req.body.password) return next();
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
    fbUserID,
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
    facebook: !fbUserID
      ? undefined
      : {
          id: fbUserID,
        },
    activated: fbUserID ? true : false,
  });
  newUser
    .save()
    .then((user) => {
      if (fbUserID) return res.status(200).json(user);
      req.user = user;
      next();
    })
    .catch((err) => {
      console.log(err);
      return res.status(500);
    });
};

const createAndSendActivationKey = (req, res, next) => {
  const { user } = req;
  if (user.activated || !user.email) return next();
  const activationKey = uuidv4();
  const newUserToken = new UserToken({
    user: user.id,
    token: activationKey,
    for: "activation",
  });
  newUserToken.save().then((token) => {
    const transporter = nodemailer.createTransport({
      host: emailAuth.host,
      port: emailAuth.port,
      secure: false,
      auth: {
        user: emailAuth.user,
        pass: emailAuth.pass,
      },
    });
    transporter.verify(function (error, success) {
      if (error) {
        console.log("Email error:" + error);
      } else {
        console.log("Server is ready to take our messages");
      }
    });
    const message = {
      from: "mustafausama@outlook.com",
      to: user.email,
      subject: "Activate your account",
      text: "Activate your account using the activation code: ".concat(
        newUserToken.token
      ),
    };
    transporter.sendMail(message, function (error, info) {
      if (error) {
        console.log(error);
        res.status(500);
      } else {
        console.log("Email sent: " + info.response);
        res.status(200).json(user);
      }
    });
  });
};

const findActivationToken = (req, res, next) => {
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
  User.findByIdAndUpdate(req.userToken.user, { activated: true }, { new: true })
    .then((user) => {
      res.status(200).json(user);
      next();
    })
    .catch((err) => {
      console.log(err);
      return res.status(500);
    });
};

const resendActivationKeyValidation = (req, res, next) => {
  User.findById(req.user.id).then((user) => {
    if (!user) return res.status(400).json({ user: "User not found" });
    if (user.activated)
      return res
        .status(400)
        .json({ userActivated: "User account is already activated" });
    UserToken.findOneAndRemove({ user: user.id, for: "activation" })
      .then((userToken) => {
        next();
      })
      .catch((err) => {
        console.log(err);
        return res.status(500);
      });
  });
};

module.exports = {
  findExistingUser,
  findNewUserRole,
  hashPassword,
  saveNewUser,
  findActivationToken,
  activateByActivationKey,
  createAndSendActivationKey,
  resendActivationKeyValidation,
};
