const express = require("express");
const { permission } = require("../../utils/controllers/authentication/auth");
const router = express.Router();
const {
  configureRestaurant,
  saveRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getAllRestaurants,
  getRestaurant,
  findRestaurantsParams,
} = require("../../utils/controllers/restaurants/restaurant");
const {
  validateRestaurant,
} = require("../../utils/validation/restaurants/restaurant");

// @route   POST api/restaurants/restaurant
// @desc    Add a new restaurant
// @access  Private: RES_NEW
router.post(
  "/",
  permission("RES_NEW"),
  validateRestaurant,
  configureRestaurant,
  saveRestaurant
);

// @route   GET api/restaurants/restaurant
// @desc    Get restaurants matching criteria
// @access  Private: RES_FIND
router.get("/", permission("RES_FIND"), findRestaurantsParams);

// @route   GET api/restaurants/resturant/all
// @desc    Get all restaurants
// @access  Private: RES_FIND
router.get("/all", permission("RES_FIND"), getAllRestaurants);

// @route   GET api/restaurants/resturant/:resID
// @desc    Return a restaurant
// @access  Private: RES_FIND
router.get("/:resID", permission("RES_FIND"), getRestaurant);

// @route   PUT api/restaurants/resturant/:resID
// @desc    Update an existing restaurant
// @access  Private: RES_EDIT
router.put(
  "/:resID",
  permission("RES_EDIT"),
  validateRestaurant,
  configureRestaurant,
  updateRestaurant
);

// @route   DELETE api/restaurants/resturant/:resID
// @desc    Delete a restaurant
// @access  Private: RES_REMOVE
router.delete("/:resID", permission("RES_REMOVE"), deleteRestaurant);

module.exports = router;
