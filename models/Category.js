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
  admins: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

module.exports = Category = mongoose.model("Category", CategorySchema);
