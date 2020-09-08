const express = require("express");
const router = express.Router();
const {
  parseArrays,
  saveCategory,
  updateCategory,
  categoryAddRestaurant,
  categoryDeleteRestaurant,
  deleteCategory,
} = require("../../utils/controllers/restaurants/restaurant");
const { validateCategory } = require("../../utils/validation/restaurant");

// @route   POST api/restaurants/category
// @desc    Create a new category
// @access  Private
// Order: parseArrays > validateCategory > saveCategory
router.post("/", parseArrays, validateCategory, saveCategory);

// @route   PUT api/restaurants/category/:catID
// @desc    Update an existing category
// @access  Private
// Order: parseArrays > validateCategory > updateCategory
router.put("/:catID", parseArrays, validateCategory, updateCategory);

// @route   DELETE api/restaurants/category/:catID
// @desc    Delete a category
// @access  Private
// Order: deleteCategory
router.delete("/:catID", deleteCategory);

// @route   POST api/restaurants/category/:catID/restaurant
// @desc    Add a restaurant to a category
// @access  Private
// Order: categoryAddRestaurant
router.post("/:catID/restaurant", categoryAddRestaurant);

// @route   DElETE api/restaurants/category/:catID/restaurant
// @desc    Deletes a restaurant from a category
// @access  Private
// Order: categoryDeleteRestaurant
router.delete("/:catID/restaurant", categoryDeleteRestaurant);

module.exports = router;
