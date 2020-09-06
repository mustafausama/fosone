const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const CryptoJS = require("crypto-js");

const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const UserToken = require("../../models/UserToken");
const secretOrKey = require("../../config/keys").secretOrKey;

const findUser = (req, res, next) => {
  const { usernameOrEmail } = req.body;
  var opts = {};
  if (req.body.fbUserID)
    opts = {
      $and: [{ "facebook.id": req.body.fbUserID }],
    };
  else
    opts = {
      $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
    };
  User.findOne(opts)
    .populate({ path: "role", select: "permissions" })
    .then((user) => {
      if (!user) return res.status(404).json({ user: "User does not exist" });
      if (!req.body.fbUserID && !user.activated)
        return res.status(400).json({
          user:
            "User account is not activated. Please check your email or phone SMS",
        });
      req.user = user;
      next();
    })
    .catch((err) => {
      console.log(err);
      return res.status(500);
    });
};

const confirmPassword = (req, res, next) => {
  if (req.body.fbUserID) return next();
  const { user } = req;
  const { password } = req.body;
  console.log(user);
  bcrypt
    .compare(password, user.password)
    .then((passed) => {
      if (!passed)
        return res.status(400).json({ password: "Incorrect password" });
      next();
    })
    .catch((err) => {
      console.log(err);
      return res.status(500);
    });
};

const signTokenAndDeliver = (req, res) => {
  const { user } = req;
  const { remember } = req.body;
  const roleEncrypted = CryptoJS.AES.encrypt(
    JSON.stringify(user.role),
    secretOrKey,
    {
      keySize: 128 / 8,
      iv: secretOrKey,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }
  );
  const tokenUUID = uuidv4();
  const tokenUUIDEncrypted = CryptoJS.AES.encrypt(
    tokenUUID,
    secretOrKey
  ).toString();
  const payload = {
    id: user.id,
    name: user.name,
    activated: user.activated,
    role: roleEncrypted.toString(),
    token: tokenUUIDEncrypted.toString(),
  };
  jwt.sign(
    payload,
    secretOrKey,
    { expiresIn: req.body.fbUserID || remember ? "365d" : "24h" },
    (err, token) => {
      if (err) {
        console.log(err);
        return res.status(500);
      }
      const expiry =
        req.body.fbUserID || remember
          ? 1000 * 60 * 60 * 24 * 365
          : 1000 * 60 * 60 * 24;
      const newUserToken = new UserToken({
        user: user.id,
        token,
        for: "login",
        expiry: new Date(+new Date() + expiry),
      });
      newUserToken
        .save()
        .then((usertoken) => {
          return res.status(200).json({
            token: "Bearer " + token,
          });
        })
        .catch((err) => {
          console.log(err);
          return res.status(500);
        });
    }
  );
};

module.exports = {
  findUser,
  confirmPassword,
  signTokenAndDeliver,
};
