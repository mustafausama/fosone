const isEmptyObject = require("is-empty-object");

const { isEmpty, isLength, isNumeric } = require("validator");

const countryList = require("country-list");

const { isLatitude, isLongitude } = require("../../jsUtils");

module.exports.validateCategory = (req, res, next) => {
  const errors = {};
  var { uName, title, admin } = req.body;

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
