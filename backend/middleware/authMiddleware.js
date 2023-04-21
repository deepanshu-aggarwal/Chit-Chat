const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // get the user id
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // console.log(decoded);

      // modifying the req to set the user object in request if valid token
      // not setting the password into request
      // middlewares can modify the request and response
      req.user = await User.findById(decoded.id).select("-password");

      next();
    } catch (err) {
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  } else {
    res.status(401);
    throw new Error("Not authorized");
  }
});

module.exports = protect;
