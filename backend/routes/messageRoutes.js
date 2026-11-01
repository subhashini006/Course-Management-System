const express = require("express");
const router = express.Router();

const controller = require("../controllers/messageController");
const authMiddleware = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { mongoIdParam } = require("../validators/common");

router.use(authMiddleware);

// "contacts" must be declared before "/:userId" or it would be read as an id
router.get("/contacts", controller.getContacts);
router.get("/:userId", mongoIdParam("userId", "user ID"), validateRequest, controller.getHistory);

module.exports = router;
