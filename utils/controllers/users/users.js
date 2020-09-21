const User = require("../../../models/User");
const Role = require("../../../models/Role");

const ObjectId = require("mongoose").Types.ObjectId;

module.exports.getAllUsers = async (req, res) => {
  const users = await User.find().catch();
  if (users) return res.status(200).json(users);
};

module.exports.getUserById = async (req, res) => {
  const { userID } = req.params;
  if (!userID) return res.status(400).json({ userID: "User ID is required" });
  if (!ObjectId.isValid(userID))
    return res.status(400).json({ userID: "Invalid User ID" });
  const user = await User.findById(userID).select("-password").catch();
  if (!user) return res.status(404).json({ nouser: "User doesn't exist" });
  res.status(200).json(user);
};

module.exports.updateUserById = async (req, res, next) => {
  const {
    firstName,
    lastName,
    username,
    phone,
    email,
    password,
    birthdate,
    country,
  } = req.body;
  const { userID } = req.params;
  if (!ObjectId.isValid(userID))
    return res.status(400).json({ userID: "Invalid User ID" });
  const user = await User.findById(userID).catch();
  if (!user) return res.status(404).json({ nouser: "User doesn't exist" });
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (username) user.username = username;
  if (phone) user.phone = phone;
  if (email) {
    if (email.toLowerCase() === user.email.toLowerCase())
      this.email = undefined;
    else user.email = email;
  }
  if (password) {
    const salt = await bcrypt.genSalt(10).catch();
    const hash = await bcrypt.hash(password, salt).catch();
    user.password = hash;
  }
  if (birthdate) user.birthdate = birthdate;
  if (country) user.country = country;
  user = user.save().catch();
  if (email) {
    req.body.user = user;
    return next();
  }
  res.status(200).json(user);
};

module.exports.deleteUserById = async (req, res) => {
  const { userID } = req.params;
  if (!ObjectId.isValid(userID))
    return res.status(400).json({ userID: "Invalid User ID" });
  const user = User.findByIdAndDelete(userID).select("-password").catch();
  if (!user) return res.status(404).json({ nouser: "User doesn't exist" });
  res.status(200).json(user);
};

module.exports.updateUserRole = async (req, res) => {
  const { userID, roleID } = req.params;
  if (!userID) return res.status(400).json({ userID: "User ID is required" });
  if (!ObjectId.isValid(userID))
    return res.status(400).json({ userID: "Invalid User ID" });
  if (!roleID) return res.status(400).json({ roleID: "Role is required" });

  const $opt = ObjectId.isValid(roleID) ? { _id: roleID } : { name: roleID };

  const role = await Role.find($opt).catch();
  if (!role) return res.status(404).json({ norole: "Role doesn't exist" });

  const user = await User.findById(userID).catch();
  if (!user) return res.status(404).json({ nouser: "User doesn't exist" });

  user.role = role.id;
  user = user.save().catch();

  res.status(200).json(user);
};

module.exports.activateUser = async (req, res) => {
  const { userID } = req.params;
  if (!userID) return res.status(400).json({ userID: "User ID is required" });
  if (!ObjectId.isValid(userID))
    return res.status(400).json({ userID: "Invalid User ID" });

  const user = await User.findById(userID).catch();

  if (!user) return res.status(404).json({ nouser: "User doesn't exist" });

  user.activated = true;
  user = user.save().catch();

  res.status(200).json({ activated: true, id: user.id });
};
