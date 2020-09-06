const express = require("express");
const router = express.Router();

const {
  validateFacebookLogin,
  validateLogin,
} = require("../../utils/validation/login");

const {
  findUser,
  confirmPassword,
  signTokenAndDeliver,
} = require("../../utils/controllers/login");

// @route   POST api/users/login
// @desc    Login User / Return JWT Token
// @access  Public
// Order: validateFacebookLogin > validateLogin > findUser > confirmPassword > signTokenAndDeliver
router.post(
  "/",
  validateFacebookLogin,
  validateLogin,
  findUser,
  confirmPassword,
  signTokenAndDeliver
);

module.exports = router;
