const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
  uName: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  picture: String,
  restaurants: [
    {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
    },
  ],
});

module.exports = Category = mongoose.model("Category", CategorySchema);
