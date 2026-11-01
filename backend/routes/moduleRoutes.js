const express = require("express");
const router = express.Router();

const { getStoredModule } = require("../controllers/moduleController");
const validateRequest = require("../middleware/validateRequest");
const { mongoIdParam } = require("../validators/common");

// Course content is public, like the course catalog itself
router.get("/:id", mongoIdParam("id", "course ID"), validateRequest, getStoredModule);

module.exports = router;
