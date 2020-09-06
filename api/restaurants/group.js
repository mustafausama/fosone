const express = require("express");
const router = express.Router();
const {
  parseArrays,
  saveGroup,
  updateGroup,
  deleteGroup,
  groupAddRestaurant,
  groupDeleteRestaurant,
} = require("../../utils/controllers/restaurant");
const { validateGroup } = require("../../utils/validation/restaurant");

// @route   POST api/restaurants/group
// @desc    Create a new group
// @access  Private
// Order: parseArrays > validateGroup > saveGroup
router.post("/", parseArrays, validateGroup, saveGroup);

// @route   PUT api/restaurants/group/:grpID
// @desc    Update an existing group
// @access  Private
// Order: parseArrays > validateGroup > updateGroup
router.put("/:grpID", parseArrays, validateGroup, updateGroup);

// @route   DELETE api/restaurants/group/:grpID
// @desc    Delete a group
// @access  Private
// Order: deleteGroup
router.delete("/:grpID", deleteGroup);

// @route   POST api/restaurants/group/:grpID/restaurant
// @desc    Add a restaurant to a group
// @access  Private
// Order: groupAddRestaurant
router.post("/:grpID/restaurant", groupAddRestaurant);

// @route   DELETE api/restaurants/group/:grpID/restaurant
// @desc    Delete a restaurant from a group
// @access  Private
// Order: groupAddRestaurant
router.delete("/:grpID/restaurant", groupDeleteRestaurant);

module.exports = router;
