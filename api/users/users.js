const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  updateUserRole,
  activateUser,
} = require("../../utils/controllers/users/users");

const { validateUpdateUser } = require("../../utils/validation/users/users");
const {
  createAndSendActivationKey,
} = require("../../utils/controllers/users/registration");

// @route   GET api/users
// @desc    Returns a list of users
// @access  Public
router.get("/", getAllUsers);

// @route   GET api/users
// @desc    Returns a user by ID
// @access  Public
router.post("/:userID", getUserById);

// @route   PUT api/users/:userID
// @desc    Updates user by ID
// @access  Public
router.put(
  "/:userID",
  validateUpdateUser,
  updateUserById,
  createAndSendActivationKey
);

// @route   DELETE api/users/:userID
// @desc    Deletes a user by ID
// @access  Public
router.delete("/:userID", deleteUserById);

// @route   PUT api/users/:userID/role/:roleID
// @desc    Updates user's role
// @access  Public
router.put("/:userID/role/:roleID", updateUserRole);

// @route   PUT api/users/:userID/activate
// @desc    Activates user by ID
// @access  Public
router.put("/:userID/activate", activateUser);

module.exports = router;
