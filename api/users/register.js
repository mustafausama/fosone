const express = require("express");
const router = express.Router();

const {
  validateNewRegistration,
  validateActivationKey,
} = require("../../utils/validation/register");

const {
  findExistingUser,
  findNewUserRole,
  hashPassword,
  saveNewUser,
  findActivationToken,
  activateByActivationKey,
} = require("../../utils/middlewares/registration");

// @route   POST api/users/register
// @desc    Register a new user
// @access  Public
// Order: validateNewRegistration > validateUserExists > validateNewUserRoleExists > hashPassword > saveNewUser
router.post(
  "/",
  validateNewRegistration,
  findExistingUser,
  findNewUserRole,
  hashPassword,
  saveNewUser
);

// @route   POST api/users/register/activate/:activationKey
// @desc    Activate user account
// @access  Public
// Order: validateActivationKey > findActivationToken > activateByActivationKey
router.post(
  "/activate/:activationKey",
  validateActivationKey,
  findActivationToken,
  activateByActivationKey
);

module.exports = router;
