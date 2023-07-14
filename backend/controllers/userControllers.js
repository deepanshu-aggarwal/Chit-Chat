const User = require("../models/userModel");
const generateToken = require("../config/generateToken");
const { hashPassword, matchPassword } = require("../utils/password");

const registerUser = async (req, res) => {
  const { name, email, password, pic } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ success: false, message: "Fields missing" });
    return;
  }

  try {
    // check if user exists, email should be unique
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ success: false, message: "User already exists" });
      return;
    }

    //otherwise, create new user
    const encryptedPassword = await hashPassword(password);
    const user = await User.create({
      name,
      email,
      password: encryptedPassword,
      pic,
    });

    if (user) {
      res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: {
          _id: user.id,
          name: user.name,
          email: user.email,
          pic: user.pic,
          token: generateToken(user._id),
        },
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Registration failed", error });
  }
};

const authUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password){
    res.status(400).json({ success: false, message: "User or password missing" });
    return;
  }
  
  try {
    const user = await User.findOne({ email });

    if (!user){
      res.status(400).json({ success: false, message: "User not found" });
      return;
    }

    // handle if user not found
    const doesPasswordMatch = await matchPassword(password, user.password);
    if (!doesPasswordMatch){
      res.status(400).json({ success: false, message: "Invalid email or password" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Login failed", error });
  }
};

// /api/user?search=deepanshu
const allUsers = async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  try {
    const users = await User.find(keyword)
      .find({ _id: { $ne: req.user._id } })
      .select("-password");
    res.status(200).json({ success: true, message: "Fetched users", users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Search failed", error });
  }
};

module.exports = { registerUser, authUser, allUsers };
