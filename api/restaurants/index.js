const express = require("express");
const router = express.Router();

router.use("/restaurant", require("./restaurant"));
router.use("/category", require("./category"));
router.use("/group", require("./group"));
router.use("/menu", require("./menu"));

module.exports = router;
