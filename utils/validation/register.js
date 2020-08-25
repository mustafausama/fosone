const passwordValidator = require("password-validator");
const axios = require("axios");

const { countries } = require("countries-list");

const { validate: uuidvalidate } = require("uuid");

const isEmptyObject = require("is-empty-object");

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

/*
fbFirstName: "",
fbLastName: "",
fbEmail: "",
fbUserID: "",
fbAccessToken: "",
*/

const validateFacebookRegister = (req, res, next) => {
  if (!req.body.fbAccessToken || !req.body.fbUserID) return next();
  const { fbAccessToken, fbUserID } = req.body;
  let urlGraphFacebook = `https://graph.facebook.com/v2.11/${fbUserID}/`;
  axios
    .get(urlGraphFacebook, {
      params: {
        access_token: fbAccessToken,
        fields: "id,first_name,last_name,email",
      },
    })
    .then((response) => {
      req.body.firstName = response.data.first_name;
      req.body.lastName = response.data.last_name;
      req.body.email = response.data.email;
      req.body.fbUserID = response.data.id;
      next();
    })
    .catch((err) => {
      console.log(err);
      return res.status(500);
    });
};

const validateNewRegistration = (req, res, next) => {
  const errors = {};
  var {
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

  // Validate required data
  if (!firstName || isEmpty((firstName = firstName.trim())))
    errors.firstName = "First name field is required";
  if (!lastName || isEmpty((lastName = lastName.trim())))
    errors.lastName = "Last name field is required";
  if (!username || isEmpty((username = username.trim())))
    errors.username = "Username field is required";
  if (!password1 || isEmpty((password1 = password1.trim())))
    errors.password1 = "Password field is required";
  if (!password2 || isEmpty((password2 = password2.trim())))
    errors.password2 = "Password verification field is required";
  if (!birthdate || isEmpty((birthdate = birthdate.trim())))
    errors.birthdate = "Date of birth field is required";
  if (!country || isEmpty((country = country.trim())))
    errors.country = "Country field is required";
  if (
    (!email || isEmpty((email = email.trim()))) &&
    (!phone || isEmpty((phone = phone.trim())))
  )
    errors.phoneOrEmail =
      "Either a phone number or an email address is required";
  if (!isEmptyObject(errors)) return res.status(400).json(errors);

  // Validate correct data
  if (!isLength(firstName, { min: 2, max: 26 }))
    errors.firstName = "First name should be 2 to 26 characters long";
  if (!isLength(lastName, { min: 2, max: 26 }))
    errors.lastName = "Last name should be 2 to 26 characters long";
  if (
    !isLength(username, { min: 3, max: 20 }) ||
    !isAlphanumeric(username) ||
    isNumeric(username.charAt(0))
  )
    errors.username =
      "Username should be 2 to 20 characters long, contain only aphanumeric chacaters, have an alphabet character as the first character";
  if (
    phone &&
    !isEmpty(phone) &&
    !isMobilePhone(phone, "any", { strictMode: true })
  )
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
  dateLimit.setFullYear(dateLimit.getFullYear - ageLimit);
  if (!isDate(birthdate) || isAfter(birthdate, dateLimit.toDateString()))
    errors.birthdate = "Invalid date of birth. You should be 12 years or older";

  if (!isLength(country, { min: 2, max: 2 }) || !countries[country])
    errors.country = "Invalid country";

  // Validate password
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
    .spaces()
    .is()
    .not()
    .oneOf([firstName, lastName, username, birthdate]);
  if (!schema.validate(password1))
    errors.password1 =
      "Password is invalida. Password should be 8 to 100 characters. It should contain at least one lowercase character, one uppercase character, one digit, and one symbol. It should not contain spaces, your first name, your last name, your username, or your date of birth";
  if (!equals(password1, password2))
    errors.password2 = "Passwords should match";
  if (!isEmptyObject(errors)) return res.status(400).json(errors);
  req.body.password = password1;
  next();
};

const validateActivationKey = (req, res, next) => {
  if (!uuidvalidate(req.params.activationKey))
    return res.status(400).json({ activationKey: "Invalid activation key" });
  next();
};

module.exports = {
  validateFacebookRegister,
  validateNewRegistration,
  validateActivationKey,
};
