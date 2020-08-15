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
        return !this.working.weekDays.all;
      },
    },
    end: {
      type: Number,
      min: 0,
      max: 6,
      required: function () {
        return !this.working.weekDays.all;
      },
    },
  },
  hours: {
    all: {
      type: Boolean,
      required: true,
    },
    hoursForDays: {
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
              return !this.working.hours.hoursForDays.all;
            },
          },
          end: {
            type: Number,
            min: 0,
            max: 23,
            required: function () {
              return !this.working.hours.hoursForDays.all;
            },
          },
        },
      ],
      required: function () {
        return !this.working.hours.all;
      },
      validate: function (val) {
        return (
          val.length !==
          this.working.weekDays.end - this.working.weekDays.start + 1
        );
      },
    },
  },
});

module.exports = Working = mongoose.model("workings", WorkingSchema);
