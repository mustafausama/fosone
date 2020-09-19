const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const WorkingSchema = new Schema({
  days: {
    type: [
      {
        dayOfWeek: Number,
        openHour: Number,
        closeHour: Number,
      },
    ],
    required: true,
  },
});

module.exports = Working = mongoose.model("Working", WorkingSchema);
