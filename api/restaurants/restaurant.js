const express = require("express");
const router = express.Router();
const {
  parseArrays,
  findDBIDs,
  createSchemas,
  saveRestaurant,
} = require("../../utils/middlewares/restaurant");
const { validateNewRestaurant } = require("../../utils/validation/restaurant");

// @route   POST api/restaurants/register
// @desc    Add a new restaurant
// @access  Public
// Order: parseArrays > validateNewRestaurant > findDBIDs > createSchemas > saveRestaurant
router.post(
  "/",
  parseArrays,
  validateNewRestaurant,
  findDBIDs,
  createSchemas,
  saveRestaurant
);

module.exports = router;
