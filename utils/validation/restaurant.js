const isEmptyObject = require("is-empty-object");
const ObjectId = require("mongoose").Types.ObjectId;

const {
  isEmpty,
  isLength,
  isNumeric,
  isMobilePhone,
  equals,
  isIn,
  isInt,
  isFloat,
} = require("validator");

const { countries } = require("countries-list");

function isLatitude(lat) {
  return isFinite(lat) && Math.abs(lat) <= 90;
}

function isLongitude(lng) {
  return isFinite(lng) && Math.abs(lng) <= 180;
}

module.exports.validateRestaurant = (req, res, next) => {
  const errors = {};
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
    categories,
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
  } = req.body;
  //if (admins) admins.push(req.user.id);
  //else admins = [req.user.id];
  const prefix = ["delivery", "takeaway", "onSite"];
  if (!name || isEmpty((name = name.trim())))
    errors.name = "Restaurant name is required";
  if (!phonenumbers || phonenumbers.length === 0)
    errors.phonenumbers =
      "There should be at least 1 phone number corresponding to this restarant";
  if (!delivery && !takeaway && !onSite)
    errors.working = "At least one catering service must be available";
  if (!country || isEmpty((country = country.trim())))
    errors.country = "Country is required";
  if (!city || isEmpty((city = city.trim()))) errors.city = "City is required";
  if (!street || isEmpty((street = street.trim())))
    errors.street = "Street is required";
  if (!building || isEmpty((building = building.trim())))
    errors.building = "Building number is required";
  if (!categories || categories.length === 0)
    errors.categories = "Restaurant category/ies is/are required";
  if (!latitude || isEmpty((latitude = latitude.trim())))
    errors.latitude = "Geolocation latitude is required";
  if (!longitude || isEmpty((longitude = longitude.trim())))
    errors.longitude = "Geolocation longitude is required";
  for (var i = 0; i < prefix.length; i++) {
    const p = prefix[i];
    if (!req.body[p]) continue;
    if (
      !req.body[p + "_allWeekDays"] ||
      !isIn(req.body[p + "_allWeekDays"], ["YES", "NO"])
    )
      errors[p + "_allWeekDays"] = "All Week days field is required";
    if (
      req.body[p + "_allWeekDays"] &&
      equals(req.body[p + "_allWeekDays"], "NO")
    ) {
      if (!req.body[p + "_weekStart"])
        errors[p + "_weekStart"] = "Week beginning field is required";
      if (!req.body[p + "_weekEnd"])
        errors[p + "_weekEnd"] = "Week end field is required";
    }
    if (
      !req.body[p + "_allHours"] ||
      !isIn(req.body[p + "_allHours"], ["YES", "NO"])
    )
      errors[p + "_allHours"] = "All Hours field is required";
    if (req.body[p + "_allHours"] && equals(req.body[p + "_allHours"], "NO")) {
      if (
        !req.body[p + "_hoursPerDay"] ||
        req.body[p + "_hoursPerDay"].length === 0
      )
        errors[p + "_hoursPerDay"] =
          "Hours per day is requried for every working day";
      else
        req.body[p + "_hoursPerDay"].forEach((value, id) => {
          if (!value.all || !isIn(value.all, ["YES", "NO"]))
            errors[p + "_hoursPerDay"] = `All hours field for the day number ${
              id + 1
            } is required`;
          else if (value.all && equals(value.all, "NO")) {
            if (!value.start)
              errors[
                p + "_hoursPerDay"
              ] = `Start hours field for the day number ${id + 1} is required`;
            if (!value.end)
              errors[
                p + "_hoursPerDay"
              ] = `End hours field for the day number ${id + 1} is required`;
          }
        });
    }
  }
  if (!isEmptyObject(errors)) return res.status(400).json(errors);

  if (!isLength(name, { min: 2, max: 50 }))
    errors.name = "Restaurant name must be 2 to 50 characters long";
  if (description && !isLength(description, { min: 2, max: 500 }))
    errors.name = "Restaurant name must be 2 to 500 characters long";
  phonenumbers.forEach((value) => {
    if (!isMobilePhone(value, "any", { strictMode: true })) {
      if (!errors.phonenumbers) errors.phonenumbers = "";
      errors.phonenumbers += `Invalid phone number: ${value}`;
    }
  });
  /*category.forEach((cat, id) => {
    if (!ObjectId.isValid(cat))
      errors.category = "Invalid category ID at: " + (id + 1);
  });*/
  if (!isLength(country, { min: 2, max: 2 }) || !countries[country])
    errors.country = "Invalid country";
  if (state && !isLength(state, { min: 2, max: 100 }))
    errors.state = "Invalid state";
  if (!isLength(city, { min: 2, max: 100 })) errors.city = "Invalid city";
  if (!isLength(street, { min: 2, max: 200 })) errors.street = "Invalid street";
  if (!isLength(building, { min: 2, max: 50 }))
    errors.building = "Invalid building";
  if (storeNumber && !isLength(storeNumber, { min: 1, max: 50 }))
    errors.storeNumber = "Invalid store Number";
  if (!isLatitude(latitude)) errors.latitude = "Invalid geolocation latitude";
  if (!isLongitude(longitude))
    errors.longitude = "Invalid geolocation longitude";
  for (var i = 0; i < prefix.length; i++) {
    const p = prefix[i];
    if (!req.body[p]) continue;

    if (equals(req.body[p + "_allWeekDays"], "NO")) {
      if (
        !isNumeric(req.body[p + "_weekStart"]) ||
        !isInt(req.body[p + "_weekStart"], { min: 0, max: 6 })
      )
        errors[p + "_weekStart"] = "Week start should be number";
      if (
        !isNumeric(req.body[p + "_weekEnd"]) ||
        !isInt(req.body[p + "_weekEnd"], { min: 0, max: 6 })
      )
        errors[p + "_weekEnd"] = "Week end should be number";
    }
    req.body[p + "_allWeekDays"] = equals(req.body[p + "_allWeekDays"], "YES");
    if (
      equals(req.body[p + "_allHours"], "NO") &&
      req.body[p + "_hoursPerDay"].length !==
        Math.abs(req.body[p + "_weekEnd"] - req.body[p + "_weekStart"]) + 1
    )
      errors[p + "_hoursPerDay"] =
        "Number of hours per day does not equal the number of working week days";
    else if (equals(req.body[p + "_allHours"], "NO"))
      req.body[p + "_hoursPerDay"].forEach((value, id) => {
        req.body[p + "_hoursPerDay"][id].all = equals(value.all, "YES");
        if (value.all) return;
        if (!isFloat(value.start, { min: 0, max: 23.5 }))
          errors[
            p + "_hoursPerDay"
          ] = `Day start field should be a decimal within [0, 23.5] in the day number ${
            id + 1
          }`;
        if (!isFloat(value.end, { min: 0, max: 23.5 }))
          errors[
            p + "_hoursPerDay"
          ] = `Day end field should be a decimal within [0, 23.5] in the day number ${
            id + 1
          }`;
        Math.round(req.body[p + "_hoursPerDay"][i].start * 2) / 2;
        Math.round(req.body[p + "_hoursPerDay"][i].end * 2) / 2;
      });
    req.body[p + "_allHours"] = equals(req.body[p + "_allHours"], "YES");
  }
  req.body.delivery = delivery ? true : false;
  req.body.takeaway = takeaway ? true : false;
  req.body.onSite = onSite ? true : false;
  if (!isEmptyObject(errors)) return res.status(400).json(errors);
  next();
};

module.exports.validateCategory = (req, res, next) => {
  const errors = {};
  var { uName, title, admins } = req.body;

  //if (admins) admins.push(req.user.id);
  //else admins = [req.user.id];

  if (!uName || isEmpty((uName = uName.trim())))
    errors.uName = "Category unique name is required";
  if (!title || isEmpty((title = title.trim())))
    errors.title = "Category title is required";
  if (!isEmptyObject(errors)) return res.status(400).json(errors);

  if (!isLength(uName, { min: 3, max: 50 }))
    errors.uName = "Category unique name has to be 3 to 50 characters long";
  if (!isLength(title, { min: 2, max: 100 }))
    errors.title = "Category title has to be 2 to 100 characters long";
  if (!isEmptyObject(errors)) return res.status(400).json(errors);
  next();
};

module.exports.validateGroup = (req, res, next) => {
  const errors = {};
  var { uName, title, admins, phonenumbers } = req.body;

  //if (admins) admins.push(req.user.id);
  //else admins = [req.user.id];

  if (!uName || isEmpty((uName = uName.trim())))
    errors.uName = "Category unique name is required";
  if (!title || isEmpty((title = title.trim())))
    errors.title = "Category title is required";
  if (!phonenumbers || phonenumbers.length === 0)
    errors.phonenumbers = "Phone numbers are required";
  if (!isEmptyObject(errors)) return res.status(400).json(errors);

  if (!isLength(uName, { min: 3, max: 50 }))
    errors.uName = "Category unique name has to be 3 to 50 characters long";
  if (!isLength(title, { min: 2, max: 100 }))
    errors.title = "Category title has to be 2 to 100 characters long";
  phonenumbers.forEach((value) => {
    if (!isMobilePhone(value, "any", { strictMode: true })) {
      if (!errors.phonenumbers) errors.phonenumbers = "";
      errors.phonenumbers += `Invalid phone number: ${value}`;
    }
  });
  if (!isEmptyObject(errors)) return res.status(400).json(errors);
  next();
};
