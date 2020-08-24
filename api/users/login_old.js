const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const secretOrKey = require("../../config/keys").secretOrKey;
const User = require("../../models/User");

const validateLogin = require("../../utils/validation/login");

// @route   POST api/users/login
// @desc    Login User / Return JWT Token
// @access  Public
router.post("/", validateLogin, (req, res) => {
  const { usernameOrEmail, password, remember } = req.body;
  User.findOne({
    $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
  }).then((user) => {
    if (!user) return res.status(404).json({ user: "User does not exist" });
    bcrypt
      .compare(password, user.password)
      .then((passed) => {
        if (!passed)
          return res.status(400).json({ password: "Incorrect password" });
        const payload = {
          id: user.id,
          name: user.name,
          activated: user.activated,
          role: user.role,
        };
        jwt.sign(
          payload,
          secretOrKey,
          {
            expiresIn: remember ? "365d" : "24h",
          },
          (err, token) => {
            if (err) return res.status(500).json(err);
            res.json({
              token: "Bearer " + token,
            });
          }
        );
      })
      .catch((err) => {
        res.status(500).json(err);
      });
  });
});
module.exports = router;
