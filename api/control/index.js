const express = require("express");
const router = express.Router();

router.use("/suggestions", require("./suggestions"));

module.exports = router;
