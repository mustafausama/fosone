const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserTokenSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "users",
  },
  token: {
    type: String,
    required: true,
  },
  for: {
    type: String,
    required: true,
  },
  created: {
    type: Date,
    default: Date.now(),
  },
  expiry: {
    type: Date,
    default: new Date(+new Date() + 60 * 60 * 1000),
  },
});

module.exports = UserToken = mongoose.model("UserToken", UserTokenSchema);
