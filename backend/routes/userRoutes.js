const express = require("express");
const {
  registerUser,
  authUser,
  allUsers,
} = require("../controllers/userControllers");

const router = express.Router();

router.route("/").post(registerUser).get(allUsers);
router.route("/login").post(authUser);
// router.post("/login", authUser);

module.exports = router;
