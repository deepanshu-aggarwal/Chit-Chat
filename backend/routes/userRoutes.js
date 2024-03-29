const express = require("express");
const {
  registerUser,
  authUser,
  allUsers,
} = require("../controllers/userControllers");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").post(registerUser).get(protect, allUsers); // if protect passes forwards request to allUsers else send error
router.route("/login").post(authUser);
// router.post("/login", authUser);

module.exports = router;
