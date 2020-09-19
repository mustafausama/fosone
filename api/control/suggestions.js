const express = require("express");
const { permission } = require("../../utils/controllers/authentication/auth");
const router = express.Router();

const {
  getUsersSuggestions,
  getCategoriesSuggestions,
  getGroupsSuggestions,
} = require("../../utils/controllers/control/suggestions");

// @route   POST api/suggestions/users
// @desc    Return a list of users matching options
// @access  Public
router.get("/users", getUsersSuggestions);

// @route   POST api/suggestions/users
// @desc    Return a list of users matching options
// @access  Public
router.get("/categories", permission("RES_FIND"), getCategoriesSuggestions);

// @route   POST api/suggestions/users
// @desc    Return a list of users matching options
// @access  Public
router.get("/groups", permission("RES_FIND"), getGroupsSuggestions);

module.exports = router;
