const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../../models/User");
const Role = require("../../models/Role");

const validateNewRegistration = require("../../utils/validation/register")
  .validateNewRegistration;

// @route   POST api/users/register
// @desc    Register a new user
// @access  Public
router.post("/", validateNewRegistration, (req, res) => {
  const {
    firstName,
    lastName,
    username,
    phone,
    email,
    password,
    country,
    birthdate,
  } = req.body;
  User.findOne({ $or: [{ email }, { username }] })
    .then((user) => {
      if (user) {
        return res
          .status(400)
          .json(
            user.username === username
              ? { username: "Username Exists" }
              : { email: "Email exists" }
          );
      }
      Role.findOne({ name: "NEW_USER" })
        .then((role) => {
          if (!role)
            return res
              .status(500)
              .json({ site: "Registration is not available yet" });
          const newUserRole = role.id;
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
          bcrypt
            .genSalt(10)
            .then((salt) => {
              bcrypt
                .hash(newUser.password, salt)
                .then((hash) => {
                  newUser.password = hash;
                  newUser
                    .save()
                    .then((user) => {
                      return res.status(200).json(user);
                    })
                    .catch((err) => {
                      return res.status(500).json(err);
                    });
                })
                .catch((err) => {
                  res.status(500).json(err);
                });
            })
            .catch((err) => {
              res.status(500).json(err);
            });
        })
        .catch((err) => {
          res.status(500).json(err);
        });
    })
    .catch((err) => {
      return res.status(500).json(err);
    });
});
module.exports = router;
