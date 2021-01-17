const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MenuItem = require("./MenuItem").schema;

const MenuSchema = new Schema({
  name: { type: String, required: true },
  categories: {
    type: [
      {
        categoryName: {
          type: String,
          required: true
        },
        categoryDescription: String,
        items: [
          {
            type: Schema.Types.ObjectId,
            ref: "MenuItem"
          }
        ]
      }
    ],
    required: true
  },
  date: {
    type: Date,
    default: Date.now()
  }
});

module.exports = Menu = mongoose.model("Menu", MenuSchema);
