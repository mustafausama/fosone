const isEmptyObject = require("is-empty-object");

const {
  isAlphanumeric,
  isEmpty,
  isLength,
  isNumeric,
  isEmail,
} = require("validator");

const validateLogin = (req, res, next) => {
  const errors = {};
  var { usernameOrEmail, password } = req.body;
  if (!usernameOrEmail || isEmpty((usernameOrEmail = usernameOrEmail.trim())))
    errors.usernameOrEmail = "Username or Email is reqired";
  if (!password || isEmpty((password = password.trim())))
    errors.password = "Password is required";
  if (!isEmptyObject(errors)) return res.status(400).json(errors);
  if (
    !isEmail(usernameOrEmail, {
      allow_utf8_local_part: false,
      allow_ip_domain: true,
    }) &&
    (!isLength(usernameOrEmail, { min: 3, max: 20 }) ||
      !isAlphanumeric(usernameOrEmail) ||
      isNumeric(usernameOrEmail.charAt(0)))
  )
    errors.usernameOrEmail = "Not username nor email is valid";
  if (!isEmptyObject(errors)) return res.status(400).json(errors);
  next();
};

module.exports.validateLogin = validateLogin;
