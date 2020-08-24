const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Working = require("./Working");
const Location = require("./Location");
const Menu = require("./Menu");

const RestaurantSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  phonenumbers: {
    type: [String],
    required: true,
  },
  delivery: {
    type: Boolean,
    default: false,
  },
  takeaway: {
    type: Boolean,
    default: false,
  },
  onSiteOrder: {
    type: Boolean,
    default: false,
  },
  deliveryWorking: {
    type: Working,
    required: () => {
      return this.delivery;
    },
  },
  takeawayWorking: {
    type: Working,
    required: () => {
      return this.takeaway;
    },
  },
  onsiteWorking: {
    type: Working,
    required: () => {
      return this.onSiteOrder;
    },
  },
  address: {
    type: String,
    required: true,
  },
  geolocation: {
    type: Location,
    required: true,
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
  },
  admins: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "users",
      },
    },
  ],
  category: {
    type: Schema.Types.ObjectId,
    ref: "categories",
  },
  group: {
    type: Schema.Types.ObjectId,
    ref: "groups",
  },
  menus: [Menu],
});

module.exports = Restaurant = mongoose.model("restaurants", RestaurantSchema);
