const ObjectId = require("mongoose").Types.ObjectId;

const Working = require("../../../models/Working");
const Location = require("../../../models/Location");
const User = require("../../../models/User");
const Restaurant = require("../../../models/Restaurant");
const Category = require("../../../models/Category");
const Group = require("../../../models/Group");

const isEmptyObject = require("is-empty-object");
const e = require("express");

module.exports.parseArrays = (req, res, next) => {
  var i = 0;
  const phonenumbers = [];
  while (req.body["phonenumber" + i])
    phonenumbers.push(req.body["phonenumber" + i++]);

  i = 0;
  const admins = [];
  while (req.body["admin" + i]) admins.push(req.body["admin" + i++]);

  i = 0;
  const categories = [];
  while (req.body["category" + i]) categories.push(req.body["category" + i++]);

  const delivery_hoursPerDay = [];
  if (req.body.delivery) {
    i = 0;
    while (req.body["delivery_hoursPerDayAll" + i])
      delivery_hoursPerDay.splice(i, 0, {
        all: req.body["delivery_hoursPerDayAll" + i],
        start: req.body["delivery_hoursPerDayStart" + i],
        end: req.body["delivery_hoursPerDayEnd" + i++],
      });
  }

  const takeaway_hoursPerDay = [];
  if (req.body.takeaway) {
    i = 0;
    while (req.body["takeaway_hoursPerDayAll" + i])
      takeaway_hoursPerDay.splice(i, 0, {
        all: req.body["takeaway_hoursPerDayAll" + i],
        start: req.body["takeaway_hoursPerDayStart" + i],
        end: req.body["takeaway_hoursPerDayEnd" + i++],
      });
  }

  const onSite_hoursPerDay = [];
  if (req.body.onSite) {
    i = 0;
    while (req.body["onSite_hoursPerDayAll" + i])
      onSite_hoursPerDay.splice(i, 0, {
        all: req.body["onSite_hoursPerDayAll" + i],
        start: req.body["onSite_hoursPerDayStart" + i],
        end: req.body["onSite_hoursPerDayEnd" + i++],
      });
  }
  if (phonenumbers.length > 0) req.body.phonenumbers = phonenumbers;
  if (admins.length > 0) req.body.admins = admins;
  if (categories.length > 0) req.body.categories = categories;
  if (req.body.delivery && delivery_hoursPerDay.length > 0)
    req.body.delivery_hoursPerDay = delivery_hoursPerDay;
  if (req.body.takeaway && takeaway_hoursPerDay.length > 0)
    req.body.takeaway_hoursPerDay = takeaway_hoursPerDay;
  if (req.body.onSite && onSite_hoursPerDay.length > 0)
    req.body.onSite_hoursPerDay = onSite_hoursPerDay;
  next();
};

/*    delivery_allWeekDays,
    delivery_weekStart,
    delivery_weekEnd,
    delivery_allHours,
    delivery_hoursPerDay,
    takeaway_allWeekDays,
    takeaway_weekStart,
    takeaway_weekEnd,
    takeaway_allHours,
    takeaway_hoursPerDay,
    onSite_allWeekDays,
    onSite_weekStart,
    onSite_weekEnd,
    onSite_allHours,
    onSite_hoursPerDay,*/
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
  if (!isEmptyObject(errors)) return res.status(400).json(errors);

  req.body.location = new Location({
    coordinates: [req.body.latitude, req.body.longitude],
  });
  const prefix = ["delivery", "takeaway", "onSite"];
  for (var i = 0; i < prefix.length; i++) {
    const p = prefix[i];
    if (!req.body[p]) continue;
    req.body[p + "Working"] = new Working({
      weekDays: {
        all: req.body[p + "_allWeekDays"] === "YES",
        start: req.body[p + "_weekStart"],
        end: req.body[p + "_weekEnd"],
      },
      hours: {
        all: req.body[p + "_allHours"],
        hoursPerDay: req.body[p + "_hoursPerDay"],
      },
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
    location,
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
    location: {
      address: {
        country,
        state,
        city,
        street,
        building,
        storeNumber,
      },
      geolocation: location,
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
    location,
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
      geolocation: location,
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
  const restaurant = await Restaurant.findByIdAndDelete(resID)
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

module.exports.saveGroup = async (req, res) => {
  const { uName, title, picture, phonenumbers, admins } = req.body;
  const group = await Group.findOne({ uName }).catch((err) => {
    console.log(err);
    res.status(500);
  });
  if (group)
    return res.status(400).json({ uName: "Group unique name already exists" });
  const newGroup = new Group({
    uName,
    title,
    picture,
    phonenumbers,
    admins,
  });
  newGroup
    .save()
    .then((group) => {
      res.status(200).json(group);
    })
    .catch((err) => {
      console.log(err);
      res.status(500);
    });
};

module.exports.updateGroup = async (req, res) => {
  const { grpID } = req.params;
  const { uName, title, picture, phonenumbers, admins } = req.body;
  const newGroup = {
    uName,
    title,
    picture,
    phonenumbers,
    admins,
  };
  if (!ObjectId.isValid(grpID))
    return res.status(400).json({ invalidID: "Invalid ID" });
  const Group = await Group.findOne({ uName });
  if (group)
    return res.status(400).json({ uName: "Group unique name already exists" });
  Group.findByIdAndUpdate(catID, newGroup, { new: true })
    .then((group) => {
      if (!group)
        return res.status(404).json({
          nogroup: "Cannot find a group with the specified id",
        });
      res.status(200).json(group);
    })
    .catch((err) => {
      console.log(err);
      res.status(500);
    });
};

module.exports.deleteGroup = async (req, res) => {
  const { grpID } = req.params;
  if (!grpID) return res.status(400).json({ grpID: "Group ID is required" });
  if (!ObjectId.isValid(grpID))
    return res.status(400).json({ grpID: "Invalid group ID" });
  const group = await Group.findById(grpID).catch((err) => {
    console.log(err);
    res.status(500);
  });
  if (!group) return res.status(404).json({ nogroup: "Group cannot be found" });
  const restaurants = group.restaurants;
  await asyncForEach(restaurants, (restaurant) => {
    Restaurant.findByIdAndUpdate(
      restaurant,
      {
        $unset: { group: "" },
      },
      { new: true }
    ).catch((err) => {
      console.log(err);
      res.status(500);
    });
  });
  group
    .remove()
    .then((group) => {
      res.status(200).json(group);
    })
    .catch((err) => {
      console.log(err);
      res.status(500);
    });
};

module.exports.groupAddRestaurant = async (req, res) => {
  const { resID } = req.body;
  const { grpID } = req.params;
  const errors = {};
  if (!resID) errors.resID = "Restaurant ID is required";
  if (!ObjectId.isValid(resID)) errors.resID = "Invalid restaurant ID";
  if (!ObjectId.isValid(grpID)) errors.grpID = "Invalid group ID";
  const restaurant = await Restaurant.findById(resID).catch((err) => {
    console.log(err);
    res.status(500);
  });
  if (!restaurant)
    return res.status(404).json({ norestaurant: "Restaurant cannot be found" });
  const group = await Group.findByIdAndUpdate(
    grpID,
    {
      $addToSet: { restaurants: restaurant.id },
    },
    { new: true }
  );
  if (!group) return res.status(404).json({ nogroup: "Group cannot be found" });
  if (restaurant.group && restaurant.group.equals(group.id))
    return res
      .status(400)
      .json({ alreadyexists: "Restaurant alredy exists in this group" });
  restaurant.group = group.id;
  restaurant
    .save()
    .then((restaurant) => {
      res.status(200).json({ restaurant, group });
    })
    .catch((err) => {
      console.log(err);
      res.status(500);
    });
};

module.exports.groupDeleteRestaurant = async (req, res) => {
  const { resID } = req.body;
  const { grpID } = req.params;
  const errors = {};
  if (!grpID) errors.resID = "Group ID is required";
  if (!ObjectId.isValid(resID)) errors.resID = "Invalid restaurant ID";
  if (!ObjectId.isValid(grpID)) errors.grpID = "Invalid group ID";
  if (!isEmptyObject(errors)) return res.status(400).json(errors);
  const restaurant = await Restaurant.findByIdAndUpdate(
    resID,
    {
      $unset: { group: "" },
    },
    { new: true }
  ).catch((err) => {
    console.log(err);
    res.status(500);
  });
  if (!restaurant)
    return res.status(404).json({ norestaurant: "Restaurant cannot be found" });
  const group = await Group.findByIdAndUpdate(
    grpID,
    {
      $pull: { restaurants: restaurant.id },
    },
    { new: true }
  );
  if (!group) return res.status(404).json({ nogroup: "Group cannot be found" });
  res.status(200).json({ restaurant, group });
};

const includesByEquals = async (arr, val) => {
  var flag = false;
  await asyncForEach(arr, async (elem) => {
    flag = flag || elem.equals(val);
  });
  return flag;
};

const indexOfEquals = async (arr, val) => {
  var index = -1;
  await asyncForEach(arr, async (elem, i) => {
    if (index > -1) return;
    if (elem.equals(val)) index = i;
  });
  return index;
};

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}
