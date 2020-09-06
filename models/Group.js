const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const GroupSchema = new Schema({
  uName: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  picture: String,
  phonenumbers: {
    type: [String],
    required: true,
  },
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

module.exports = Group = mongoose.model("Group", GroupSchema);
