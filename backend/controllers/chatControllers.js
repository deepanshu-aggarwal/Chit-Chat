const expressAsyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");
const Message = require("../models/messageModel");

const accessChat = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res
      .status(400)
      .send({ success: false, message: "UserId params not sent in request" });
  }

  try {
    const member = await User.findById(userId);
    if (!member)
      return res
        .status(400)
        .send({ success: false, message: "Member doesn't exists" });

    let isChat = await Chat.findOne({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");
    // populate fetches the information from the User model as chatmodel's users array consist of id referencing to User
    // the first argument is the name of the field in model to populate

    isChat = await Message.populate(isChat, {
      path: "latestMessage.sender",
      select: "name pic email",
    });
    // to get the sender of the message User model is used to populate a specific sender field in Message model
    // and selecting only desired fields from User model
    if (isChat) {
      res
        .status(200)
        .send({ success: true, message: "Chat Accessed", chat: isChat });
    } else {
      const chatData = {
        chatName: "sender",
        isGroupChat: false,
        users: [req.user._id, userId],
      };

      const createdChat = await Chat.create(chatData);
      const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res
        .status(201)
        .send({ success: true, message: "New chat created", chat: fullChat });
    }
  } catch (error) {
    res
      .status(500)
      .send({ success: false, message: "Something went wrong", error });
  }
};

const fetchChats = async (req, res) => {
  try {
    let chats = Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    chats = await Message.populate(chats, {
      path: "latestMessage.sender",
      select: "name pic email",
    });

    res
      .status(200)
      .send({ success: true, message: "Chats fetched successfully", chats });
  } catch (error) {
    res
      .status(500)
      .send({ success: false, message: "Something went wrong", error });
  }
};

const createGroupChat = expressAsyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    res.status(400).send({ message: "Please fill all fields" });
  }

  const users = JSON.parse(req.body.users);
  if (users.length < 2) {
    res.status(400).send({ message: "Group should contain atleast 2 users" });
  }

  users.push(req.user._id);

  try {
    const group = {
      chatName: req.body.name,
      isGroupChat: true,
      users: [...users],
      groupAdmin: req.user._id,
    };

    const groupChat = await Chat.create(group);
    const createdGroupChat = await Chat.findOne({
      _id: { $eq: groupChat._id },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(201).send({
      success: true,
      message: "New group chat created",
      chat: createdGroupChat,
    });
  } catch (error) {
    res
      .status(500)
      .send({ success: false, message: "Something went wrong", error });
  }
});

const renameGroup = expressAsyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName: chatName,
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    res
      .status(500)
      .send({ success: false, message: "Something went wrong", error });
  } else {
    res.status(200).send({
      success: true,
      message: "Group name updated",
      chat: updatedChat,
    });
  }
});

const addToGroup = expressAsyncHandler(async (req, res) => {
  const { users, chatId } = req.body;

  const userIds = JSON.parse(users);
  try {
    const chat = await Chat.findById(chatId);
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        users: [...chat.users, ...userIds],
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).send({
      success: true,
      message: "Users added to group",
      chat: updatedChat,
    });
  } catch (error) {
    res
      .status(500)
      .send({ success: false, message: "Something went wrong", error });
  }
});

const removeFromGroup = expressAsyncHandler(async (req, res) => {
  const { userId, chatId } = req.body;

  try {
    let updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: { users: userId },
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (updatedChat.groupAdmin._id.equals(userId)) {
      updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        {
          groupAdmin: updatedChat.users[0],
        },
        { new: true }
      )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");
    }

    res.status(200).send({
      success: true,
      message: "User removed from group",
      chat: updatedChat,
    });
  } catch (error) {
    res
      .status(500)
      .send({ success: false, message: "Something went wrong", error });
  }
});

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
};
