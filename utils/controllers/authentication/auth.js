const jwt = require("jsonwebtoken");
const CryptoJS = require("crypto-js");
const { isBefore } = require("validator");
const UserToken = require("../../../models/UserToken");

const secretOrKey = require("../../../config/keys").secretOrKey;

module.exports.permission = (permission) => {
  return (req, res, next) => {
    // Parsing token
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res
        .status(403)
        .json({ authorization: "Authorization header cannot be found" });
    const arr = authHeader.split(" ");
    if (arr.length !== 2)
      return req
        .status(403)
        .json({ authorization: "Authorization header is invalid" });
    token = arr[1];

    // Verifying token with secret
    jwt.verify(token, secretOrKey, async (err, payload) => {
      if (err) return res.status(403).json({ token: "Invalid token" });
      var { tokenUUID, role } = payload;
      tokenUUID = CryptoJS.AES.decrypt(tokenUUID, secretOrKey).toString(
        CryptoJS.enc.Utf8
      );

      // Finding token in DB
      const userToken = await UserToken.findOne({ token: tokenUUID })
        .populate("user")
        .catch();
      if (!userToken)
        return res
          .status(403)
          .json({ token: "Token may have expired or cancelled" });

      // Checking expiration
      if (isBefore(userToken.expiry.toDateString(), new Date().toDateString()))
        return res.status(403).json({ token: "Token has expired" });

      // Verifying role/permission
      /*role = JSON.parse(
        CryptoJS.AES.decrypt(role, secretOrKey, {
          keySize: 128 / 8,
          iv: secretOrKey,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        }).toString(CryptoJS.enc.Utf8)
      );*/
      if (!role.permissions.includes(permission))
        return res.status(403).json({ token: "Permission is not given" });

      // Success
      req.user = userToken.user;
      next();
    });
  };
};
