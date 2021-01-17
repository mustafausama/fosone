const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MenuItemSchema = new Schema({
  name: {
    type: String,
    required: () => {
      return this.description ? false : true;
    },
  },
  description: String,
  picture: String,
  price: Number,
  date: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = MenuItem = mongoose.model("MenuItem", MenuItemSchema);
