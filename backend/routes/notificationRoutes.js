const express = require("express");
const router = express.Router();

const controller = require("../controllers/notificationController");
const authMiddleware = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { mongoIdParam } = require("../validators/common");

router.use(authMiddleware);

router.get("/", controller.getNotifications);
router.patch("/read-all", controller.markAllRead);
router.patch("/:id/read", mongoIdParam("id", "notification ID"), validateRequest, controller.markRead);

module.exports = router;
