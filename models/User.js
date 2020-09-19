const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Working = require("./Working").schema;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  phone: String,
  email: String,
  password: String, // required if facebook is not provided
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
      required: () => {
        return this.facebook;
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
    ref: "Location",
  },
  addressList: [
    {
      state: String,
      city: String,
      street: String,
      building: String,
      floor: String,
      apartment: String,
      availability: Working,
      phone: String,
      location: {
        type: Schema.Types.ObjectId,
        ref: "Location",
      },
    },
  ],
  role: {
    type: Schema.Types.ObjectId,
    ref: "Role",
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
});

module.exports = User = mongoose.model("User", UserSchema);

/*UserSchema.statics.findAllUsers = function (...args) {
  const func = async function (resolve, reject, ...args) {
    const users = await this.find();
    setTimeout(() => {
      console.log(this.args);
      resolve(users);
    }, 3000);
  };
  this.args = args;
  return new Promise(func.bind(this));
};*/
/*
UserSchema.statics.findAllUsers = async function () {
  const users = await this.find().catch((err) => Promise.reject(err));
  return Promise.resolve(users);
};
*/
