const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: () => {
      return !this.email;
    },
  },
  email: {
    type: String,
    required: () => {
      return !this.phone;
    },
  },
  password: {
    type: String,
    required: true,
  },
  birthdate: {
    type: Date,
    required: true,
  },
  picture: {
    type: String,
  },
  facebook: {
    id: {
      type: Number,
    },
    accessToken: {
      type: String,
      required: () => {
        return this.facebook && this.facebook.id && true;
      },
    },
    firstName: {
      type: String,
      required: () => {
        return this.facebook && this.facebook.id && true;
      },
    },
    lastName: {
      type: String,
      required: () => {
        return this.facebook && this.facebook.id && true;
      },
    },
  },
  timeZone: {
    type: String,
  },
  country: {
    type: String,
    required: true,
  },
  location: {
    type: Schema.Types.ObjectId,
    ref: "locations",
  },
  addressList: [
    {
      state: String,
      city: String,
      street: String,
      building: String,
      floor: String,
      apartment: String,
      availability: {
        type: Schema.Types.ObjectId,
        ref: "workings ",
      },
      phone: String,
      location: {
        type: Schema.Types.ObjectId,
        ref: "locations",
      },
    },
  ],
  role: {
    type: Schema.Types.ObjectId,
    ref: "roles",
    required: true,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  activated: {
    type: Boolean,
    default: false,
  },
  // TODO: Logins
});

module.exports = User = mongoose.model("users", UserSchema);
