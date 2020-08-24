const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const secretOrKey = require("../../config/keys").secretOrKey;

const findUser = (req, res, next) => {
  const { usernameOrEmail } = req.body;
  User.findOne({
    $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
  })
    .then((user) => {
      if (!user) return res.status(404).json({ user: "User does not exist" });
      req.user = user;
      next();
    })
    .catch((err) => {
      console.log(err);
      return res.status(500);
    });
};

const confirmPassword = (req, res, next) => {
  const { user } = req;
  const { password } = req.body;
  bcrypt
    .compare(password, user.password)
    .then((passed) => {
      if (!passed)
        return res.status(400).json({ password: "Incorrect password" });
      req.jwtPayload = {
        id: user.id,
        name: user.name,
        activated: user.activated,
        role: user.role,
      };
      next();
    })
    .catch((err) => {
      console.log(err);
      return res.status(500);
    });
};

const signTokenAndDeliver = (req, res, next) => {
  const { jwtPayload: payload } = req;
  const { remember } = req.body;
  jwt.sign(
    payload,
    secretOrKey,
    {
      expiresIn: remember ? "365d" : "24h",
    },
    (err, token) => {
      if (err) {
        console.log(err);
        return res.status(500);
      }
      return res.json({
        token: "Bearer " + token,
      });
    }
  );
};

module.exports = {
  findUser,
  confirmPassword,
  signTokenAndDeliver,
};
