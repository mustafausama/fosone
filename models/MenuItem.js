const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MenuItemSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  price: Number,
  date: {
    type: Date,
    default: Date.now(),
  },
});

MenuItemSchema.add({
  options: [MenuItemSchema],
});

module.exports = MenuItemSchema;
