const isEmptyObject = require("is-empty-object");

const { isEmpty, isLength, isUppercase } = require("validator");

module.exports.validateRole = (req, res, next) => {
  const errors = {};
  var { name, permissions } = req.body;

  if (!name || isEmpty(name)) errors.name = "Role name is required";
  if (!permissions) errors.permissions = "Role permissions are required";

  if (!isEmptyObject(errors)) return res.status(400).json(errors);

  if (!isLength(name, { min: 2, max: 50 }) || !isUppercase(name))
    errors.name = "Invalid name";
  if (!Array.isArray(permissions) || permissions.length === 0)
    errors.permissions = "Invalid permissions";
  if (Array.isArray(permissions))
    permissions.forEach((permission, i) => {
      if (
        isEmpty(permission) ||
        !isLength(permission, { min: 2, max: 50 }) ||
        !isUppercase(permission)
      )
        errors.permissions = `Invalid permission: ${i + 1}`;
    });

  if (!isEmptyObject(errors)) return res.status(400).json(errors);

  next();
};
