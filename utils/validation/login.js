const isEmptyObject = require("is-empty-object");
const axios = require("axios");

const {
  isAlphanumeric,
  isEmpty,
  isLength,
  isNumeric,
  isEmail,
} = require("validator");

const validateFacebookLogin = (req, res, next) => {
  if (!req.body.fbAccessToken || !req.body.fbUserID) return next();
  const { fbAccessToken, fbUserID } = req.body;
  let urlGraphFacebook = `https://graph.facebook.com/v2.12/${fbUserID}/`;
  axios
    .get(urlGraphFacebook, {
      params: {
        access_token: fbAccessToken,
        fields: "id",
      },
    })
    .then((response) => {
      if (!response)
        return res.status(400).json({ facebook: "Bad request params" });
      delete req.body.fbAccessToken;
      req.body.fbUserID = response.data.id;
      console.log(req.body);
      next();
    })
    .catch((err) => {
      console.log(err);
      return res.status(500);
    });
};

const validateLogin = (req, res, next) => {
  if (req.body.fbUserID) return next();
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

module.exports = {
  validateFacebookLogin,
  validateLogin,
};
