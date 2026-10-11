const express = require("express");
const { getModules, getStoredModule } = require("../controllers/moduleController");

const router = express.Router();

router.get("/", getModules);
router.get("/:id", getStoredModule);

module.exports = router;
