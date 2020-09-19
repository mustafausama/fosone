const express = require("express");
const router = express.Router();
const {
  findRestaurantsParams,
} = require("../../utils/controllers/restaurants/restaurant");

const {
  saveCategory,
  updateCategory,
  categoryAddRestaurant,
  categoryDeleteRestaurant,
  deleteCategory,
} = require("../../utils/controllers/restaurants/category");

const {
  validateCategory,
} = require("../../utils/validation/restaurants/category");
const {
  validateFindRestaurants,
} = require("../../utils/validation/restaurants/restaurant");
const { permission } = require("../../utils/controllers/authentication/auth");

// @route   POST api/restaurants/category
// @desc    Create a new category
// @access  Private: CATEGORY_NEW
router.post("/", permission("CATEGORY_NEW"), validateCategory, saveCategory);

// @route   PUT api/restaurants/category/:catID
// @desc    Update an existing category
// @access  Private: CATEGORY_EDIT
router.put(
  "/:catID",
  permission("CATEGORY_EDIT"),
  validateCategory,
  updateCategory
);

// @route   DELETE api/restaurants/category/:catID
// @desc    Delete a category
// @access  Private: CATEGORY_REMOVE
router.delete("/:catID", permission("CATEGORY_REMOVE"), deleteCategory);

// @route   POST api/restaurants/category/:catID/restaurant
// @desc    Add a restaurant to a category
// @access  Private
router.post(
  "/:catID/restaurant",
  permission("CATEGORY_ADD_RES"),
  categoryAddRestaurant
);

// @route   DElETE api/restaurants/category/:catID/restaurant
// @desc    Deletes a restaurant from a category
// @access  Private
router.delete(
  "/:catID/restaurant",
  permission("CATEGORY_REMOVE_RES"),
  categoryDeleteRestaurant
);

// @route   GET api/restaurants/category/:catID/restaurants
// @desc    Returns a list of restaurants meeting search criteria in a category
// @access  Private: CATEGORY_VIEW_RES
router.get(
  "/:catID/restaurants",
  permission("CATEGORY_VIEW_RES"),
  validateFindRestaurants,
  findRestaurantsParams
);

module.exports = router;
