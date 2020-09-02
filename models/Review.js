const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
  for: {
    type: Schema.Types.ObjectId,
    ref: "Restaurant",
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
      ref: "User",
      required: true,
    },
    text: String,
  },
});

module.exports = Review = mongoose.model("Review", ReviewSchema);
