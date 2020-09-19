const isEmptyObject = require("is-empty-object");

const { isEmpty, isLength, isMobilePhone } = require("validator");

const countryList = require("country-list");

const { isLatitude, isLongitude } = require("../../jsUtils");

module.exports.validateGroup = (req, res, next) => {
  const errors = {};
  var { uName, title, admins, phonenumbers } = req.body;

  if (admins && req.user) admins.push(req.user.id);
  else if (req.user) admins = [req.user.id];

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
