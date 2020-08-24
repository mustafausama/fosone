const express = require("express");
const router = express.Router();

const validateLogin = require("../../utils/validation/login").validateLogin;

const {
  findUser,
  confirmPassword,
  signTokenAndDeliver,
} = require("../../utils/middlewares/login");

// @route   POST api/users/login
// @desc    Login User / Return JWT Token
// @access  Public
// Order: validateLogin > findUser > confirmPassword > signTokenAndDeliver
router.post("/", validateLogin, findUser, confirmPassword, signTokenAndDeliver);
module.exports = router;
