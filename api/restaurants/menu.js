const express = require("express");
const router = express.Router();

// @route   POST api/restaurants/menu/:resID
// @desc    Adds a menu to a restaurant
// @access  Private: RES_ADD_MENU
router.post("/:resID");

// @route   GET api/restaurants/menu/:menuID
// @desc    Returns a menu
// @access  Private: RES_VIEW_MENU
router.post("/:menuID");

// @route   PUT api/restaurants/menu/:resID/:menuID
// @desc    Edits a menu
// @access  Private: RES_EDIT_MENU
router.put("/:resID/:menuID");

// @route   DELETE api/restaurants/menu/:resID/:menuID
// @desc    Deletes a menu
// @access  Private: RES_REMOVE_MENU
router.delete("/:resID/:menuID");

module.exports = router;
