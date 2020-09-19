const isEmptyObject = require("is-empty-object");

const { isEmpty, isLength, isMobilePhone, isDecimal } = require("validator");

const countryList = require("country-list");

const { isLatitude, isLongitude } = require("../../jsUtils");

module.exports.validateRestaurant = (req, res, next) => {
  const errors = {};
  var {
    name,
    description,
    phonenumbers,
    delivery,
    takeaway,
    onSite,
    delivery_working,
    takeaway_working,
    onSite_working,
    country,
    state,
    city,
    street,
    building,
    storeNumber,
    latitude,
    longitude,
    categories,
    admins,
  } = req.body;
  if (admins && req.user) admins.push(req.user.id);
  else if (req.user) admins = [req.user.id];
  const prefix = ["delivery", "takeaway", "onSite"];
  if (!name || isEmpty((name = name.trim())))
    errors.name = "Restaurant name is required";
  if (
    !phonenumbers ||
    !Array.isArray(phonenumbers) ||
    phonenumbers.length === 0
  )
    errors.phonenumbers = "At least one phone number should be provided";
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
  if (
    delivery &&
    (!delivery_working ||
      !Array.isArray(delivery_working) ||
      delivery_working.length === 0)
  )
    errors.delivery = "Delivery working hours should be specified";
  if (
    takeaway &&
    (!takeaway_working ||
      !Array.isArray(takeaway_working) ||
      takeaway_working.length === 0)
  )
    errors.takeaway = "Takeaway working hours should be specified";
  if (
    onSite &&
    (!onSite_working ||
      !Array.isArray(onSite_working) ||
      onSite_working.length === 0)
  )
    errors.onSite = "On-site working hours should be specified";
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
  if (
    !isLength(country, { min: 2, max: 2 }) ||
    !countryList.getCodes().includes(country)
  )
    errors.country = "Invalid country";
  if (state && !isLength(state, { min: 2, max: 100 }))
    errors.state = "Invalid state";
  if (!isLength(city, { min: 2, max: 100 })) errors.city = "Invalid city";
  if (!isLength(street, { min: 2, max: 200 })) errors.street = "Invalid street";
  if (!isLength(building, { min: 1, max: 50 }))
    errors.building = "Invalid building";
  if (storeNumber && !isLength(storeNumber, { min: 1, max: 50 }))
    errors.storeNumber = "Invalid store Number";
  if (!isLatitude(latitude)) errors.latitude = "Invalid geolocation latitude";
  if (!isLongitude(longitude))
    errors.longitude = "Invalid geolocation longitude";

  for (var i = 0; i < prefix.length; i++)
    if (req.body[prefix[i]])
      req.body[prefix[i] + "_working"].forEach((working, index) => {
        if (working.dayOfWeek > 6 || working.dayOfWeek < 0)
          errors[prefix[i]] = `Select a valid day in day ${index + 1}`;
        if (working.openHour > 24 || working.openHour < 0)
          errors[prefix[i]] = `Select a valid opening hour in day ${index + 1}`;
        if (working.closeHour > 24 || working.closeHour < 0)
          errors[prefix[i]] = `Select a valid closing hour in day ${index + 1}`;
      });

  req.body.delivery = delivery ? true : false;
  req.body.takeaway = takeaway ? true : false;
  req.body.onSite = onSite ? true : false;
  if (!isEmptyObject(errors)) return res.status(400).json(errors);
  next();
};

module.exports.validateFindRestaurants = (req, res, next) => {
  const errors = {};
  const { name, latitude, longitude, distance, minRating, country } = req.query;

  if (name && !isLength(name, { min: 2, max: 50 }))
    errors.name = "Restaurant name must be 2 to 50 characters long";
  if (
    latitude &&
    longitude &&
    (!isLatitude(latitude) || !isLongitude(longitude))
  )
    errors.name = "Latitude and/or longitude are/is invalid";
  if (distance && !isDecimal(distance)) errors.distance = "Invalid distance";
  if (minRating && (minRating > 5 || minRating < 0))
    errors.minRating = "Min rating should be between 0 and 5, inclusive";
  if (
    countr &&
    (!isLength(country, { min: 2, max: 2 }) ||
      !countryList.getCodes().includes(country))
  )
    errors.country = "Invalid country";

  if (!isEmptyObject(errors)) return res.status(400).json(errors);

  next();
};
