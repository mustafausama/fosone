const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LocationSchema = new Schema({
  coordinates: {
    type: [Number],
    required: true,
    validate: function (val) {
      return val.length === 2;
    },
  },
});

module.exports = Location = mongoose.model("locations", LocationSchema);
