const ObjectId = require("mongoose").Types.ObjectId;

const Restaurant = require("../../../models/Restaurant");
const Category = require("../../../models/Category");

const isEmptyObject = require("is-empty-object");

const { indexOfEquals, asyncForEach } = require("../../jsUtils");

module.exports.saveCategory = async (req, res) => {
  const { uName, title, picture, admins } = req.body;
  const category = await Category.findOne({ uName }).catch((err) => {
    console.log(err);
    res.status(500);
  });
  if (category)
    return res
      .status(400)
      .json({ uName: "Category unique name already exists" });
  const newCategory = new Category({
    uName,
    title,
    picture,
    admins,
  });
  newCategory
    .save()
    .then((category) => {
      res.status(200).json(category);
    })
    .catch((err) => {
      console.log(err);
      res.status(500);
    });
};

module.exports.updateCategory = async (req, res) => {
  const { catID } = req.params;
  const { uName, title, picture, admins } = req.body;
  const newCategory = {
    uName,
    title,
    picture,
    admins,
  };
  if (!ObjectId.isValid(catID))
    return res.status(400).json({ invalidID: "Invalid ID" });
  const category = await Category.findOne({ uName });
  if (category)
    return res
      .status(400)
      .json({ uName: "Category unique name already exists" });
  Category.findByIdAndUpdate(catID, newCategory, { new: true })
    .then((category) => {
      if (!category)
        return res.status(404).json({
          nocategory: "Cannot find a category with the specified id",
        });
      res.status(200).json(category);
    })
    .catch((err) => {
      console.log(err);
      res.status(500);
    });
};

module.exports.deleteCategory = async (req, res) => {
  const { catID } = req.params;
  if (!catID) return res.status(400).json({ catID: "Category ID is required" });
  if (!ObjectId.isValid(catID))
    return res.status(400).json({ catID: "Invalid category ID" });
  const category = await Category.findById(catID).catch((err) => {
    console.log(err);
    res.status(500);
  });
  if (!category)
    return res.status(404).json({ nocategory: "Category cannot be found" });
  const restaurants = category.restaurants;
  await asyncForEach(restaurants, (restaurant) => {
    Restaurant.findByIdAndUpdate(
      restaurant,
      {
        $pull: { categories: catID },
      },
      { new: true }
    ).catch((err) => {
      console.log(err);
      res.status(500);
    });
  });
  category
    .remove()
    .then((category) => {
      res.status(200).json(category);
    })
    .catch((err) => {
      console.log(err);
      res.status(500);
    });
};

module.exports.categoryAddRestaurant = async (req, res) => {
  const { resID } = req.body;
  const { catID } = req.params;
  const errors = {};
  if (!resID) errors.resID = "Restaurant ID is required";
  if (!ObjectId.isValid(resID)) errors.resID = "Invalid restaurant ID";
  if (!ObjectId.isValid(catID)) errors.catID = "Invalid caegory ID";
  const restaurant = await Restaurant.findById(resID).catch((err) => {
    console.log(err);
    res.status(500);
  });
  if (!restaurant)
    return res.status(404).json({ norestaurant: "Restaurant cannot be found" });
  const category = await Category.findByIdAndUpdate(
    catID,
    {
      $addToSet: { restaurants: restaurant.id },
    },
    { new: true }
  );
  if (!category)
    return res.status(404).json({ nocategory: "Category cannot be found" });
  if ((await indexOfEquals(restaurant.categories, ObjectId(category.id))) >= 0)
    return res
      .status(400)
      .json({ alreadyexists: "Restaurant alredy exists in this category" });
  restaurant.categories.push(category.id);
  restaurant
    .save()
    .then((restaurant) => {
      res.status(200).json({ restaurant, category });
    })
    .catch((err) => {
      console.log(err);
      res.status(500);
    });
};

module.exports.categoryDeleteRestaurant = async (req, res) => {
  const { resID } = req.body;
  const { catID } = req.params;
  const errors = {};
  if (!resID) errors.resID = "Restaurant ID is required";
  if (!ObjectId.isValid(resID)) errors.resID = "Invalid restaurant ID";
  if (!ObjectId.isValid(catID)) errors.catID = "Invalid category ID";
  if (!isEmptyObject(errors)) return res.status(400).json(errors);
  const restaurant = await Restaurant.findById(resID).catch((err) => {
    console.log(err);
    res.status(500);
  });
  if (!restaurant)
    return res.status(404).json({ norestaurant: "Restaurant cannot be found" });
  const category = await Category.findByIdAndUpdate(
    catID,
    {
      $pull: { restaurants: restaurant.id },
    },
    { new: true }
  );
  if (!category)
    return res.status(404).json({ nocategory: "Category cannot be found" });
  const index = await indexOfEquals(
    restaurant.categories,
    ObjectId(category.id)
  );
  if (index < 0)
    return res
      .status(400)
      .json({ notpresent: "Restaurant is not present in this category" });
  restaurant.categories.splice(index, 1);
  restaurant
    .save()
    .then((restaurant) => {
      res.status(200).json({ restaurant, category });
    })
    .catch((err) => {
      console.log(err);
      res.status(500);
    });
};
