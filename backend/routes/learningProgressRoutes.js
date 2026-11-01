const express = require("express");
const router = express.Router();

const controller = require("../controllers/learningProgressController");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { mongoIdParam } = require("../validators/common");

router.use(authMiddleware, authorizeRoles("student"));

const courseIdParam = mongoIdParam("courseId", "course ID");

router.get("/", controller.getMyProgressList);
router.get("/:courseId", courseIdParam, validateRequest, controller.getMyProgress);
router.put("/:courseId", courseIdParam, validateRequest, controller.updateMyProgress);

module.exports = router;
