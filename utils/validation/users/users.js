const passwordValidator = require("password-validator");
const isEmptyObject = require("is-empty-object");
const countryList = require("country-list");

const {
  isEmpty,
  isLength,
  isAlphanumeric,
  isNumeric,
  isMobilePhone,
  isEmail,
  isDate,
  isAfter,
  equals,
} = require("validator");

module.exports.validateUpdateUser = (req, res, next) => {
  const errors = {};
  const {
    firstName,
    lastName,
    username,
    phone,
    email,
    password1,
    password2,
    birthdate,
    country,
  } = req.body;

  // Validate correct data
  if (firstName && !isLength(firstName, { min: 2, max: 26 }))
    errors.firstName = "First name should be 2 to 26 characters long";
  if (lastName && !isLength(lastName, { min: 2, max: 26 }))
    errors.lastName = "Last name should be 2 to 26 characters long";
  if (
    username &&
    (!isLength(username, { min: 3, max: 20 }) ||
      !isAlphanumeric(username) ||
      isNumeric(username.charAt(0)))
  )
    errors.username =
      "Username should be 2 to 20 characters long, contain only aphanumeric chacaters, have an alphabet character as the first character";
  if (phone && !isMobilePhone(phone, "any", { strictMode: true }))
    errors.phone =
      "Phone number is incorrect. You should enter + sign and country code";
  if (
    email &&
    !isEmpty(email) &&
    !isEmail(email, {
      allow_utf8_local_part: false,
      allow_ip_domain: true,
    })
  )
    errors.email = "Email address is incorrect";
  // Validate date of birth
  const ageLimit = 12;
  const dateLimit = new Date();
  dateLimit.setFullYear(dateLimit.getFullYear() - ageLimit);
  if (
    (birthdate && !isDate(birthdate)) ||
    isAfter(birthdate, dateLimit.toDateString())
  )
    errors.birthdate = "Invalid date of birth. You should be 12 years or older";

  if (
    country &&
    (!isLength(country, { min: 2, max: 2 }) ||
      !countryList.getCodes().includes(country))
  )
    errors.country = "Invalid country";
  // Validate password
  if (password1 && password2) {
    const schema = new passwordValidator();
    schema
      .is()
      .min(8)
      .is()
      .max(100)
      .has()
      .uppercase()
      .has()
      .lowercase()
      .has()
      .digits()
      .has()
      .symbols()
      .has()
      .not()
      .spaces();
    if (!schema.validate(password1))
      errors.password1 =
        "Password is invalid. Password should be 8 to 100 characters. It should contain at least one lowercase character, one uppercase character, one digit, and one symbol. It should not contain spaces.";
    if (!equals(password1, password2))
      errors.password2 = "Passwords should match";
    req.body.password = password1;
  }

  if (!isEmptyObject(errors)) return res.status(400).json(errors);
  next();
};
