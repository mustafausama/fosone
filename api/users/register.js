const express = require("express");
const router = express.Router();

const {
  validateFacebookRegister,
  validateNewRegistration,
  validateActivationKey,
} = require("../../utils/validation/users/register");

const {
  newUserConfirmation,
  hashPassword,
  saveNewUser,
  findAndActivateToken,
  resendActivationKeyValidation,
  createAndSendActivationKey,
} = require("../../utils/controllers/users/registration");
const User = require("../../models/User");

// @route   POST api/users/register
// @desc    Register a new user
// @access  Public
// Order: validateFacebook > validateNewRegistration > validateUserExists > validateNewUserRoleExists > hashPassword > saveNewUser
router.post(
  "/",
  validateFacebookRegister,
  validateNewRegistration,
  newUserConfirmation,
  hashPassword,
  saveNewUser,
  createAndSendActivationKey,
  (req, res, next) => {
    console.log("will send activation by phone");
    res.status(400).json(req.user);
  }
);

// @route   POST api/users/register/activate/:activationKey
// @desc    Activate user account
// @access  Public
// Order: validateActivationKey > findActivationToken > activateByActivationKey
router.post(
  "/activate/:activationKey",
  validateActivationKey,
  findAndActivateToken
);

// @route   POST api/users/register
// @desc    Register a new user
// @access  Private
// Order:
router.post(
  "/resendActivationKey",
  (req, res, next) => {
    User.findOne({ email: req.body.email }).then((user) => {
      if (!user) res.status(404).json({ nouser: "Cannot find any user" });
      req.user = user;
      next();
    });
  },
  resendActivationKeyValidation,
  createAndSendActivationKey
);

module.exports = router;
