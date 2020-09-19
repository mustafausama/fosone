const express = require("express");
const router = express.Router();

router.use("/login", require("./login"));
router.use("/register", require("./register"));
router.use("/role", require("./role"));
router.use("/", require("./users"));

module.exports = router;
