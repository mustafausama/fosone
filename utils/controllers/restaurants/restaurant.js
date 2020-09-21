const ObjectId = require("mongoose").Types.ObjectId;

const Working = require("../../../models/Working");
const User = require("../../../models/User");
const Restaurant = require("../../../models/Restaurant");
const Category = require("../../../models/Category");
const Group = require("../../../models/Group");

const isEmptyObject = require("is-empty-object");

const {
  includesByEquals,
  indexOfEquals,
  asyncForEach,
} = require("../../jsUtils");

module.exports.configureRestaurant = async (req, res, next) => {
  const errors = {};
  await asyncForEach(req.body.admins, (value, id) => {
    User.findOne({
      $or: [{ _id: value }, { username: value }, { email: value }],
    })
      .then((user) => {
        if (user) return (req.body.admins[id] = user._id);
        if (!errors.admins) errors.admins = "";
        errors.admins += `Cannot find user: ${value}`;
      })
      .catch((err) => {
        console.log(err);
        return res.status(500);
      });
  });
  await asyncForEach(req.body.categories, async (category, index) => {
    var $or = [{ uName: category }];
    if (ObjectId.isValid(category)) $or.push({ _id: ObjectId(category) });
    await Category.findOne({ $or })
      .then((cat) => {
        if (cat) return (req.body.categories[index] = ObjectId(cat.id));
        errors.categories = `Cannot find category: ${category}`;
      })
      .catch((err) => {
        console.log(err);
        return res.status(500);
      });
  });

  var $or = [{ uName: req.body.group }];
  if (ObjectId.isValid(req.body.group))
    $or.push({ _id: ObjectId(req.body.group) });
  await Group.findOne({ $or })
    .then((group) => {
      if (group) return (req.body.group = ObjectId(group.id));
      errors.group = `Cannot find group: ${group}`;
    })
    .catch((err) => {
      console.log(err);
      return res.status(500);
    });
  if (!isEmptyObject(errors)) return res.status(400).json(errors);
  const prefix = ["delivery", "takeaway", "onSite"];
  for (var i = 0; i < prefix.length; i++) {
    const p = prefix[i];
    if (!req.body[p]) continue;
    req.body[p + "Working"] = new Working({
      days: req.body[p + "_working"],
    });
  }
  next();
};

module.exports.saveRestaurant = async (req, res) => {
  const {
    name,
    description,
    phonenumbers,
    delivery,
    takeaway,
    onSite,
    country,
    state,
    city,
    street,
    building,
    storeNumber,
    latitude,
    longitude,
    deliveryWorking,
    takeawayWorking,
    onSiteWorking,
    categories,
    admins,
  } = req.body;
  const newRestaurant = new Restaurant({
    name,
    description,
    phonenumbers,
    delivery,
    takeaway,
    onSite,
    deliveryWorking,
    takeawayWorking,
    onSiteWorking,
    address: {
      country,
      state,
      city,
      street,
      building,
      storeNumber,
    },
    geolocation: {
      coordinates: [latitude, longitude],
    },
    categories,
    admins,
  });
  await asyncForEach(categories, async (category) => {
    await Category.findByIdAndUpdate(
      category,
      {
        $push: { restaurants: newRestaurant.id },
      },
      { new: true }
    ).catch((err) => {
      console.log(err);
      res.status(500);
    });
  });
  newRestaurant
    .save()
    .then((restaurant) => {
      res.status(200).json(restaurant);
    })
    .catch((err) => {
      console.log(err);
      res.status(500);
    });
};

// TODO
module.exports.updateRestaurant = async (req, res) => {
  const { resID } = req.params;
  var {
    name,
    description,
    phonenumbers,
    delivery,
    takeaway,
    onSite,
    country,
    state,
    city,
    street,
    building,
    storeNumber,
    latitude,
    longitude,
    deliveryWorking,
    takeawayWorking,
    onSiteWorking,
    categories,
    admins,
  } = req.body;
  const newRestaurant = {
    name,
    description,
    phonenumbers,
    delivery,
    takeaway,
    onSite,
    deliveryWorking,
    takeawayWorking,
    onSiteWorking,
    location: {
      address: {
        country,
        state,
        city,
        street,
        building,
        storeNumber,
      },
    },
    geolocation: {
      coordinates: [latitude, longitude],
    },
    admins,
  };
  if (!ObjectId.isValid(resID))
    return res.status(400).json({ invalidID: "Invalid ID" });
  Restaurant.findByIdAndUpdate(resID, newRestaurant)
    .then(async (restaurant) => {
      if (!restaurant)
        return res
          .status(404)
          .json({ norestaurant: `Cannot find restaurant: ${resID}` });
      await asyncForEach(categories, async (category) => {
        var flag = await includesByEquals(restaurant.categories, category);
        if (!flag) {
          await Category.findByIdAndUpdate(category, {
            $push: { restaurants: restaurant.id },
          }).catch((err) => {
            console.log(err);
            res.status(500);
          });
          await restaurant.categories.push(category);
        }
      });
      await asyncForEach(restaurant.categories, async (category) => {
        var flag = await includesByEquals(categories, category);
        if (!flag) {
          await Category.findByIdAndUpdate(category, {
            $pull: { restaurants: restaurant.id },
          }).catch((err) => {
            console.log(err);
            res.status(500);
          });
          await restaurant.categories.splice(
            await indexOfEquals(restaurant.categories, category),
            1
          );
        }
      });
      restaurant
        .save()
        .then((restaurant) => {
          if (restaurant) res.status(200).json(restaurant);
        })
        .catch((err) => {
          console.log(err);
          res.status(500);
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(500);
    });
};

module.exports.deleteRestaurant = async (req, res) => {
  const { resID } = req.params;
  if (!resID)
    return res.status(400).json({ resID: "Restaurant ID is required" });
  if (!ObjectId.isValid(resID))
    return res.status(400).json({ resID: "Invalid restaurant ID" });
  Restaurant.findByIdAndDelete(resID)
    .then((restaurant) => {
      if (!restaurant)
        return res.status(404).json({ norestaurant: "Cannot find restaurant" });
      res.status(200).json(restaurant);
    })
    .catch((err) => {
      console.log(err);
      res.status(500);
    });
};

module.exports.getRestaurant = async (req, res) => {
  const { resID } = req.params;
  if (!resID)
    return res.status(400).json({ resID: "Restaurant ID is required" });
  if (!ObjectId.isValid(resID))
    return res.status(400).json({ resID: "Invalid restaurant ID" });
  const restaurant = await Restaurant.findById(resID)
    .populate({ path: "admins", select: "username" })
    .populate({ path: "categories", select: "uName" })
    .populate({ path: "group", select: "uName" })
    .catch();
  if (!restaurant)
    return res.status(404).json({ norestaurant: "Cannot find restaurant" });
  res.status(200).json(restaurant);
};

module.exports.getAllRestaurants = async (req, res) => {
  const restaurants = await Restaurant.find().select("-admins").catch();
  if (!restaurants || restaurants.length === 0)
    return res.status(404).json({ norestaurants: "No restaurants" });
  res.status(200).json(restaurants);
};

module.exports.findRestaurantsParams = async (req, res) => {
  const {
    name,
    latitude,
    longitude,
    distance,
    minRating,
    hasDelivery,
    hasTakeaway,
    hasOnSite,
    country,
  } = req.query;
  const { catID } = req.params;
  const { grpID } = req.params;
  const cats = catID ? catID.split("|") : null;
  const grps = grpID ? grpID.split("|") : null;
  var $and = [];
  if (cats) $and.push({ categories: { $in: cats } });
  if (grps) $and.push({ group: { $in: grps } });
  if (name) $and.push({ name: { $regex: name, $options: "i" } });
  if (latitude && longitude && distance)
    $and.push({
      geolocation: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(latitude), parseFloat(longitude)],
          },
          $maxDistance: parseFloat(distance),
        },
      },
    });
  if (minRating) $and.push({ rating: { $gte: minRating } });
  if (hasDelivery) $and.push({ delivery: true });
  if (hasTakeaway) $and.push({ takeaway: true });
  if (hasOnSite) $and.push({ onSite: true });
  if (country) $and.push({ "location.country": country });

  const restaurants = await Restaurant.find({ $and })
    .populate("categories")
    .populate("group")
    .select("-admins")
    .catch();
  if (!restaurants || restaurants.length === 0)
    return res.status(404).json({ norestaurants: "Cannot find restaurants" });
  res.status(200).json(restaurants);
};
