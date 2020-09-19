const ObjectId = require("mongoose").Types.ObjectId;

const Restaurant = require("../../../models/Restaurant");
const Group = require("../../../models/Group");

const isEmptyObject = require("is-empty-object");

const { asyncForEach } = require("../../jsUtils");

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
