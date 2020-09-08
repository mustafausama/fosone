const User = require("../../../models/User");
const bcrypt = require("bcryptjs");
const CryptoJS = require("crypto-js");

const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const UserToken = require("../../../models/UserToken");
const secretOrKey = require("../../../config/keys").secretOrKey;

module.exports.confirmUser = async (req, res, next) => {
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
  const user = await User.findOne(opts)
    .populate({ path: "role", select: "permissions" })
    .catch((err) => {
      console.log(err);
      return res.status(500);
    });
  if (!user) return res.status(404).json({ user: "User does not exist" });
  // if (!req.body.fbUserID && !user.activated) return res.status(400).json({ user: "User account is not activated. Please check your email or phone SMS" });
  if (req.body.fbUserID) next();
  const { password } = req.body;
  const passed = await bcrypt.compare(password, user.password).catch((err) => {
    console.log(err);
    return res.status(500);
  });
  if (!passed) return res.status(400).json({ password: "Incorrect password" });
  req.user = user;
  next();
};

module.exports.signTokenAndDeliver = (req, res) => {
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
    tokenUUID: tokenUUIDEncrypted.toString(),
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
      const expiry = new Date(
        +new Date() +
          (req.body.fbUserID || remember
            ? 1000 * 60 * 60 * 24 * 365
            : 1000 * 60 * 60 * 24)
      );
      const newUserToken = new UserToken({
        user: user.id,
        token: tokenUUID,
        for: "login",
        expiry,
      });
      newUserToken
        .save()
        .then((usertoken) => {
          res.cookie("token", token, {
            expires: usertoken.expiry,
            httpOnly: true,
          });
          return res.status(200).json({
            token: `Bearer ${token}`,
          });
        })
        .catch((err) => {
          console.log(err);
          return res.status(500);
        });
    }
  );
};
