const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MenuItem = require("./MenuItem").schema;

const MenuSchema = new Schema({
  name: String,
  content: {
    type: [
      {
        categoryName: {
          type: String,
          required: true,
        },
        categoryDescription: String,
        items: {
          type: [MenuItem],
          required: true,
        },
      },
    ],
    required: true,
  },
});

module.exports = Menu = mongoose.model("Menu", MenuSchema);
