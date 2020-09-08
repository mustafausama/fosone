const jwt = require("jsonwebtoken");
const CryptoJS = require("crypto-js");
const { isBefore } = require("validator");
const ObjectId = require("mongoose").Types.ObjectId;
const UserToken = require("../../../models/UserToken");

const secretOrKey = require("../../../config/keys").secretOrKey;

module.exports.permission = (permission) => {
  return (req, res, next) => {
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
    jwt.verify(token, secretOrKey, async (err, payload) => {
      if (err) return res.status(403).json({ token: "Invalid token" });
      var { tokenUUID, role } = payload;
      tokenUUID = CryptoJS.AES.decrypt(tokenUUID, secretOrKey).toString(
        CryptoJS.enc.Utf8
      );
      const userToken = await UserToken.findOne({ token: tokenUUID })
        .populate("user")
        .catch();
      if (!userToken)
        return res
          .status(403)
          .json({ token: "Token may have expired or cancelled" });
      if (isBefore(userToken.expiry.toDateString(), new Date().toDateString()))
        return res.status(403).json({ token: "Token has expired" });
      role = JSON.parse(
        CryptoJS.AES.decrypt(role, secretOrKey, {
          keySize: 128 / 8,
          iv: secretOrKey,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        }).toString(CryptoJS.enc.Utf8)
      );
      if (!role.permissions.includes(permission))
        return res.status(403).json({ token: "Permission is not given" });
      req.user = userToken.user;
      next();
    });
  };
};
