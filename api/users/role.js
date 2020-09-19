const express = require("express");
const router = express.Router();

const { validateRole } = require("../../utils/validation/users/role");
const { newRole, updateRole } = require("../../utils/controllers/users/role");

// @route   POST api/users/role
// @desc    Creates new user role
// @access  Public
router.post("/", validateRole, newRole);

// @route   PUT api/users/role/:roleID
// @desc    Updates user role
// @access  Public
router.put("/:roleID", validateRole, updateRole);

module.exports = router;
