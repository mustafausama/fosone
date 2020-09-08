const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const nodemailer = require("nodemailer");

const User = require("../../../models/User");
const Role = require("../../../models/Role");
const UserToken = require("../../../models/UserToken");

const emailAuth = require("../../../config/keys").email;

require("mongoose").set("useFindAndModify", false);

module.exports.newUserConfirmation = async (req, res, next) => {
  const { username, email, phone, fbUserID } = req.body;
  const opts = [];
  if (username) opts.push({ username });
  if (email) opts.push({ email });
  if (phone) opts.push({ phone });
  if (fbUserID) opts.push({ "facebook.id": fbUserID });
  const user = await User.findOne({
    $or: opts,
  }).catch((err) => {
    console.log(err);
    return res.status(500);
  });
  if (user) {
    const error = {};
    if (username && user.username === username)
      error.username = "Username Exists";
    if (email && user.email === email) error.email = "Email exists";
    if (phone && user.phone === phone) error.phone = "Phone number exists";
    if (fbUserID && user.facebook.id === fbUserID)
      error.facebook = "Facebook account exists";
    return res.status(400).json(error);
  }
  const role = await Role.findOne({ name: "NEW_USER" }).catch((err) => {
    console.log(err);
    return res.status(500);
  });
  if (!role)
    return res.status(500).json({ site: "Registration is not available yet" });
  req.body.newUserRole = role.id;
  next();
};

module.exports.hashPassword = (req, res, next) => {
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

module.exports.saveNewUser = async (req, res, next) => {
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
  const user = await newUser.save().catch((err) => {
    console.log(err);
    return res.status(500);
  });
  if (user) req.body.user = user;
  if (fbUserID)
    return res
      .status(200)
      .json({ user, activation: "User is activated using Facebook" });
  /* TODO */ if (!user.email)
    return res
      .status(200)
      .json({ user, activation: "User will be activated using phone" });
  next();
};

module.exports.resendActivationKeyValidation = (req, res, next) => {
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

module.exports.createAndSendActivationKey = async (req, res, next) => {
  const { user } = req.body;
  const activationKey = uuidv4();
  const newUserToken = new UserToken({
    user: user.id,
    token: activationKey,
    for: "activation",
  });
  const userToken = await newUserToken.save().catch((err) => {
    console.log(err);
    res.status(500);
  });
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
      res.status(500);
    } else {
      console.log("Server is ready to take our messages");
    }
  });
  const message = {
    from: "mustafausama@outlook.com",
    to: user.email,
    subject: "Activate your account",
    text: "Activate your account using the activation code: ".concat(
      userToken.token
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
};

module.exports.findAndActivateToken = async (req, res, next) => {
  const userToken = await UserToken.findOneAndRemove(
    { token: req.params.activationKey, for: "activation" },
    { useFindAndModify: false }
  ).catch((err) => {
    console.log(err);
    return res.status(500);
  });
  if (!userToken)
    return res.status(400).json({ activationKey: "Invalid activation key" });
  const user = await User.findByIdAndUpdate(
    userToken.user,
    { activated: true },
    { new: true }
  ).catch((err) => {
    console.log(err);
    return res.status(500);
  });
  res.status(200).json(user);
};
