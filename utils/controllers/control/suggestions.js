const User = require("../../../models/User");
const Category = require("../../../models/Category");
const Group = require("../../../models/Group");

const { isEmpty, isLength } = require("validator");

module.exports.getUsersSuggestions = async (req, res) => {
  const { value } = req.query;
  if (!value || isEmpty(value) || !isLength(value, { min: 2, max: 100 }))
    return res.status(400).json({
      value: "An input is required with a length of 2 to 100 characters",
    });
  const users = await User.find(
    { username: { $regex: value, $options: "i" } },
    { username: 1 }
  ).catch((err) => {
    console.log(err);
    res.status(500);
  });
  if (users) res.status(200).json(users);
};

module.exports.getCategoriesSuggestions = async (req, res) => {
  const { value } = req.query;
  const opt =
    !value || isEmpty(value) || !isLength(value, { min: 0, max: 100 })
      ? {}
      : {
          $or: [
            { uName: { $regex: value, $options: "i" } },
            { title: { $regex: value, $options: "i" } },
          ],
        };

  const categories = await Category.find(opt, { uName: 1, title: 1 }).catch(
    (err) => {
      console.log(err);
      res.status(500);
    }
  );
  if (categories) res.status(200).json(categories);
};

module.exports.getGroupsSuggestions = async (req, res) => {
  const { value } = req.query;
  const opt =
    !value || isEmpty(value) || !isLength(value, { min: 0, max: 100 })
      ? {}
      : {
          $or: [
            { uName: { $regex: value, $options: "i" } },
            { title: { $regex: value, $options: "i" } },
          ],
        };

  const groups = await Group.find(opt, { uName: 1, title: 1 }).catch((err) => {
    console.log(err);
    res.status(500);
  });
  if (groups) res.status(200).json(groups);
};
