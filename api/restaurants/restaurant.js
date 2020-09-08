const express = require("express");
const router = express.Router();
const {
  parseArrays,
  configureRestaurant,
  saveRestaurant,
  updateRestaurant,
  deleteRestaurant,
} = require("../../utils/controllers/restaurants/restaurant");
const { validateRestaurant } = require("../../utils/validation/restaurant");

// @route   POST api/restaurants/resturant
// @desc    Add a new restaurant
// @access  Private
// Order: parseArrays > validateRestaurant > findDBIDs > createSchemas > saveRestaurant
router.post(
  "/",
  parseArrays,
  validateRestaurant,
  configureRestaurant,
  saveRestaurant
);

// @route   PUT api/restaurants/resturant/:resID
// @desc    Update an existing restaurant
// @access  Private
// Order: parseArrays > validateRestaurant > findDBIDs > createSchemas > updateRestaurant
router.put(
  "/:resID",
  parseArrays,
  validateRestaurant,
  configureRestaurant,
  updateRestaurant
);

// @route   DELETE api/restaurants/resturant/:resID
// @desc    Delete a restaurant
// @access  Private
// Order: deleteRestaurant
router.delete("/:resID", deleteRestaurant);

module.exports = router;
