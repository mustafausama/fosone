const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
  for: {
    type: Schema.Types.ObjectId,
    ref: "restaurants",
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    required: true,
  },
  review: {
    author: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    text: String,
  },
});

module.exports = Review = mongoose.model("reviews", ReviewSchema);
