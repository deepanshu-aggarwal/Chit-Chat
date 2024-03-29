const mongoose = require("mongoose");
const User = require("./userModel");

const messageModel = mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
    },
    content: { type: String, trim: true },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
    },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("messages", messageModel);
module.exports = Message;
