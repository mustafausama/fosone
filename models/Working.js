const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const WorkingSchema = new Schema({
  weekDays: {
    all: {
      type: Boolean,
      required: true,
    },
    start: {
      type: Number,
      min: 0,
      max: 6,
      required: function () {
        return !this.weekDays.all;
      },
    },
    end: {
      type: Number,
      min: 0,
      max: 6,
      required: function () {
        return !this.weekDays.all;
      },
    },
  },
  hours: {
    all: {
      type: Boolean,
      required: true,
    },
    hoursPerDay: {
      type: [
        {
          all: {
            type: Boolean,
            required: true,
          },
          start: {
            type: Number,
            min: 0,
            max: 23,
            required: function () {
              return !this.all;
            },
          },
          end: {
            type: Number,
            min: 0,
            max: 23,
            required: function () {
              return !this.all;
            },
          },
        },
      ],
      required: function () {
        return !this.hours.all;
      },
    },
  },
});

module.exports = Working = mongoose.model("Working", WorkingSchema);
