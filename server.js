const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

// Express app
const app = express();

// Body Parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Database
const db = require("./config/keys").mongoDB;

mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.log(err);
  });

const Restaurant = require("./models/Restaurant");

// Passport

// Routes
app.use("/api", require("./api"));

// App listen
const port = process.env.PORT || 5007;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
