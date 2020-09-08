const express = require("express");
const router = express.Router();

const {
  validateFacebookLogin,
  validateLogin,
} = require("../../utils/validation/login");

const {
  confirmUser,
  signTokenAndDeliver,
} = require("../../utils/controllers/users/login");

const { permission } = require("../../utils/controllers/authentication/auth");

// @route   POST api/users/login
// @desc    Login User / Return JWT Token
// @access  Public
// Order: validateFacebookLogin > validateLogin > findUser > confirmPassword > signTokenAndDeliver
router.post(
  "/",
  validateFacebookLogin,
  validateLogin,
  confirmUser,
  signTokenAndDeliver,
  permission("ORDER")
);

module.exports = router;
