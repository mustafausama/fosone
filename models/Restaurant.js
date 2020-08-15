const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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
    type: Schema.Types.ObjectId,
    ref: "workings",
    required: function () {
      return this.delivery;
    },
  },
  takeawayWorking: {
    type: Schema.Types.ObjectId,
    ref: "workings",
    required: function () {
      return this.takeaway;
    },
  },
  onsiteWorking: {
    type: Schema.Types.ObjectId,
    ref: "workings",
    required: function () {
      return this.onSiteOrder;
    },
  },
  location: {
    address: {
      type: String,
      required: true,
    },
    locationOnMap: {
      type: String,
      required: true,
    },
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
    ref: "resCats",
  },
  group: {
    type: Schema.Types.ObjectId,
    ref: "resGroups",
  },
});

module.exports = Restaurant = mongoose.model("restaurants", RestaurantSchema);
