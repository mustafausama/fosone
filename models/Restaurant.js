const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Working = require("./Working").schema;
const Location = require("./Location").schema;
const Menu = require("./Menu").schema;

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
  onSite: {
    type: Boolean,
    default: false,
  },
  deliveryWorking: {
    type: Working,
    required: () => {
      return this.delivery ? true : false;
    },
  },
  takeawayWorking: {
    type: Working,
    required: () => {
      return this.takeaway ? true : false;
    },
  },
  onSiteWorking: {
    type: Working,
    required: () => {
      return this.onSite ? true : false;
    },
  },
  location: {
    type: {
      address: {
        country: String,
        state: String,
        city: String,
        street: String,
        building: String,
        storeNumber: String,
      },
      geolocation: {
        type: Location,
        required: true,
      },
    },
    required: true,
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
  },
  admins: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  category: {
    type: Schema.Types.ObjectId,
    ref: "Category",
  },
  group: {
    type: Schema.Types.ObjectId,
    ref: "Group",
  },
  menus: [Menu],
});

module.exports = Restaurant = mongoose.model("Restaurant", RestaurantSchema);
