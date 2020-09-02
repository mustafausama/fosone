const mongoose = require("mongoose");
const db = require("./config/keys").mongoDB;
const Group = require("./models/Group");

mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.log(err);
  });
