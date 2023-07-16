const Chat = require("../models/chatModel");
const User = require("../models/userModel");
const Message = require("../models/messageModel");

const sendMessage = async (req, res) => {
  const { content, chatId } = req.body;

  if (!content)
    res.status(400).send({ success: false, message: "Content is required" });
  else if (!chatId)
    res.status(400).send({ success: false, message: "ChatId is required" });

  try {
    const newMessage = {
      sender: req.user._id,
      content,
      chat: chatId,
    };

    const message = await Message.create(newMessage);

    let createdMessage = await Message.findById(message._id)
      .populate("chat")
      .populate("sender", "name pic");

    createdMessage = await Chat.populate(createdMessage, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: message,
    });

    res.status(201).send({
      success: true,
      message: "Message sent successfully",
      data: createdMessage,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

const deleteMessage = async (req, res) => {
  const { messageId } = req.params;

  if (!messageId) {
    res.status(400).send({ success: false, message: "MessageId is required" });
    return;
  }

  try {
    const message = await Message.findById(messageId).populate(
      "sender",
      "name"
    );
    if (!message) {
      res.status(400).send({ success: false, message: "Message not found" });
      return;
    }

    if (!req.user._id.equals(message.sender._id)) {
      res
        .status(400)
        .send({ success: false, message: "Only sender can delete message" });
      return;
    }

    await Message.findByIdAndDelete(messageId);

    res.status(200).send({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    res
      .status(500)
      .send({ success: false, message: "Something went wrong", error });
  }
};

const fetchMessages = async (req, res) => {
  const { chatId } = req.params;

  if (!chatId) {
    res.status(400).send({ success: false, message: "ChatId is required" });
    return;
  }

  try {
    let messages = await Message.find({ chat: chatId })
      .populate("sender", "name email pic")
      .populate("chat")
      .sort({ createdAt: 1 });

    messages = await Chat.populate(messages, {
      path: "chat.users",
      select: "name email pic",
    });

    res
      .status(200)
      .send({ success: true, message: "All messages fetched", messages });
  } catch (error) {
    res
      .status(500)
      .send({ success: false, message: "Something went wrong", error });
  }
};

module.exports = { sendMessage, deleteMessage, fetchMessages };
