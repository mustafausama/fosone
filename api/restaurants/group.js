const express = require("express");
const router = express.Router();

const {
  findRestaurantsParams,
} = require("../../utils/controllers/restaurants/restaurant");

const {
  saveGroup,
  updateGroup,
  deleteGroup,
  groupAddRestaurant,
  groupDeleteRestaurant,
} = require("../../utils/controllers/restaurants/group");

const { validateGroup } = require("../../utils/validation/restaurants/group");
const {
  validateFindRestaurants,
} = require("../../utils/validation/restaurants/restaurant");
const { permission } = require("../../utils/controllers/authentication/auth");

// @route   POST api/restaurants/group
// @desc    Create a new group
// @access  Private: GROUP_NEW
router.post("/", permission("GROUP_NEW"), validateGroup, saveGroup);

// @route   PUT api/restaurants/group/:grpID
// @desc    Update an existing group
// @access  Private: GROUP_EDIT
router.put("/:grpID", permission("GROUP_EDIT"), validateGroup, updateGroup);

// @route   DELETE api/restaurants/group/:grpID
// @desc    Delete a group
// @access  Private: GROUP_REMOVE
// Order: deleteGroup
router.delete("/:grpID", permission("GROUP_REMOVE"), deleteGroup);

// @route   POST api/restaurants/group/:grpID/restaurant
// @desc    Add a restaurant to a group
// @access  Private: GROUP_ADD_RES
router.post(
  "/:grpID/restaurant",
  permission("GROUP_REMOVE"),
  groupAddRestaurant
);

// @route   DELETE api/restaurants/group/:grpID/restaurant
// @desc    Delete a restaurant from a group
// @access  Private: GROUP_REMOVE_RES
router.delete(
  "/:grpID/restaurant",
  permission("GROUP_REMOVE_RES"),
  groupDeleteRestaurant
);

// @route   GET api/restaurants/group/:grpID/restaurants
// @desc    Returns a list of restaurants meeting search criteria in a category
// @access  Private: GROUP_VIEW_RES
router.get(
  "/:grpID/restaurants",
  permission("GROUP_VIEW_RES"),
  validateFindRestaurants,
  findRestaurantsParams
);

module.exports = router;
