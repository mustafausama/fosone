const Working = require("../../models/Working");
const Location = require("../../models/Location");
const User = require("../../models/User");
const Restaurant = require("../../models/Restaurant");
const Category = require("../../models/Category");
const Group = require("../../models/Group");

const isEmptyObject = require("is-empty-object");

module.exports.parseArrays = (req, res, next) => {
  var i = 0;
  const phonenumbers = [];
  while (req.body["phonenumber" + i])
    phonenumbers.push(req.body["phonenumber" + i++]);

  i = 0;
  const admins = [];
  //admins.push(req.user.id);
  while (req.body["admin" + i]) admins.push(req.body["admin" + i++]);

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

  req.body.phonenumbers = phonenumbers;
  req.body.admins = admins;
  if (req.body.delivery && delivery_hoursPerDay.length > 0)
    req.body.delivery_hoursPerDay = delivery_hoursPerDay;
  if (req.body.takeaway && takeaway_hoursPerDay.length > 0)
    req.body.takeaway_hoursPerDay = takeaway_hoursPerDay;
  if (req.body.onSite && onSite_hoursPerDay.length > 0)
    req.body.onSite_hoursPerDay = onSite_hoursPerDay;
  next();
};

module.exports.findDBIDs = (req, res, next) => {
  const errors = {};
  req.body.admins.forEach((value, id) => {
    User.findOne({
      $or: [{ _id: value }, { username: value }, { email: value }],
    })
      .then((user) => {
        if (user) return (req.body.admins[id] = user.id);
        if (!errors.admins) errors.admins = "";
        errors.admins += `Cannot find user: ${value}`;
      })
      .catch((err) => {
        console.log(err);
        return res.status(500);
      });
  });
  Category.findOne({
    $or: [{ _id: req.body.category }, { uName: req.body.category }],
  })
    .then((cat) => {
      if (cat) return (req.body.category = cat.id);
      errors.category = `Cannot find category: ${req.body.category}`;
    })
    .catch((err) => {
      console.log(err);
      return res.status(500);
    });
  Group.findOne({
    $or: [{ _id: req.body.group }, { uName: req.body.group }],
  })
    .then((group) => {
      if (group) return (req.body.group = group.id);
      errors.group = `Cannot find group: ${req.body.group}`;
    })
    .catch((err) => {
      console.log(err);
      return res.status(500);
    });
  if (!isEmptyObject(errors)) return res.status(400).json(errors);
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

module.exports.createSchemas = (req, res, next) => {
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

module.exports.saveRestaurant = (req, res, next) => {
  const {
    name,
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
    category,
    group,
    admins,
  } = req.body;
  const newRestaurant = new Restaurant({
    name,
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
    category,
    group,
    admins,
  });
  newRestaurant
    .save()
    .then((restaurant) => {
      if (restaurant) return res.status(200).json(restaurant);
    })
    .catch((err) => {
      console.log(err);
      return res.status(500);
    });
};
