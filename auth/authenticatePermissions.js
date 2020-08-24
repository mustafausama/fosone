const jwt = require("jsonwebtoken");
const secret = require("../config/keys").secretOrKey;
const User = require("../models/User");
const Role = require("../models/Role");

const authenticatePermissions = (req, permission = "GUEST") => {
  const authHeader = req.headers.authorization;
  const back = {};
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, secret, (err, payload) => {
      if (err) {
        back = {
          auth: false,
          status: 403,
        };
        return back;
      }
      User.findById(payload.id)
        .then((user) => {
          Role.findById(user.role)
            .then((role) => {
              if (!role.permissions.includes(permission)) {
                back = {
                  auth: false,
                  status: 403,
                };
                return back;
              }
              back = { auth: true };
              return back;
            })
            .catch((err) => {
              back = {
                auth: false,
                status: 404,
                error: err,
              };
            });
        })
        .catch((err) => {
          back = {
            auth: false,
            status: 404,
            error: err,
          };
        });
    });
  } else
    back = {
      auth: false,
      status: 401,
    };
  return back;
};

module.exports = authenticatePermissions;
