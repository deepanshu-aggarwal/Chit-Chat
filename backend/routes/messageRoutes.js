const {
  sendMessage,
  fetchMessages,
  deleteMessage,
} = require("../controllers/messageControllers.js");
const protect = require("../middleware/authMiddleware.js");

const express = require("express");

const router = express.Router();

router.route("/").post(protect, sendMessage);
router.route("/:chatId").get(protect, fetchMessages);
router.route("/delete/:messageId").delete(protect, deleteMessage);

module.exports = router;
