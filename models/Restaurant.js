const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Working = require("./Working").schema;
const Menu = require("./Menu").schema;

const RestaurantSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
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
  address: {
    type: {
      country: {
        type: String,
        required: true,
      },
      state: String,
      city: {
        type: String,
        required: true,
      },
      street: {
        type: String,
        required: true,
      },
      building: {
        type: String,
        required: true,
      },
      storeNumber: String,
    },
    required: true,
  },
  geolocation: {
    type: {
      type: String,
      default: "Point",
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: function (val) {
        return val.length === 2;
      },
    },
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
  categories: [
    {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
  ],
  group: {
    type: Schema.Types.ObjectId,
    ref: "Group",
  },
  menus: [Menu],
});

RestaurantSchema.index({ geolocation: "2dsphere" });

module.exports = Restaurant = mongoose.model("Restaurant", RestaurantSchema);
