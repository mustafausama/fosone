const Role = require("../../../models/Role");
const ObjectId = require("mongoose").Types.ObjectId;
module.exports.newRole = async (req, res) => {
  const { name, permissions } = req.body;
  const existingRole = await Role.findOne({ name }).catch();
  if (existingRole)
    return res.status(400).json({ name: "Name already exists" });
  const newRole = new Role({
    name,
    permissions,
  });
  newRole
    .save()
    .then((role) => {
      if (role) res.status(200).json(role);
    })
    .catch();
};

module.exports.updateRole = async (req, res) => {
  const { name, permissions } = req.body;
  const { roleID } = req.params;
  if (!roleID || !ObjectId.isValid(roleID))
    return res.status(400).json({ roleID: "Invalid role ID" });
  const role = await Role.findById(roleID).catch();
  if (!role) return res.status(404).json({ roleID: "Role doesn't exist" });
  role.name = name;
  role.permissions = permissions;
  role
    .save()
    .then((role) => {
      if (role) res.status(200).json(role);
    })
    .catch();
};
