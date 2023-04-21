const expressAsyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

const accessChat = expressAsyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("UserId params not sent in request");
    return res.sendStatus(400);
  }

  let isChat = await Chat.find({
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

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });
  // to get the sender of the message User model is used to populate a specific sender field in Message model
  // and selecting only desired fields from User model

  if (isChat.length > 0) {
    res.status(200);
    res.send(isChat[0]);
  } else {
    const chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.send(200).send(fullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

const fetchChats = expressAsyncHandler(async (req, res) => {
  try {
    Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (chats) => {
        chats = await User.populate(chats, {
          path: "latestMessage.sender",
          select: "name pic email",
        });
        res.status(200).send(chats);
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const createGroupChat = expressAsyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    res.status(400).send({ message: "Please fill all fields" });
  }

  const users = JSON.parse(req.body.users);
  if (users.length < 2) {
    res.status(400).send({ message: "Group should contain atleast 2 users" });
  }

  users.push(req.user._id);

  const group = await Chat.create({
    chatName: req.body.name,
    isGroupChat: true,
    users: [...users],
    groupAdmin: req.user._id,
  });

  try {
    const groupChat = await Chat.create(group);
    const createdGroupChat = await Chat.findOne({
      _id: { $eq: groupChat._id },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    res.status(201);
    res.send(createdGroupChat);
  } catch (error) {
    res.status(401);
    throw new Error(error.message);
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
    res.status(404);
    throw new Error("Chat not found");
  } else {
    res.status(200).send(updatedChat);
  }
});

const addToGroup = expressAsyncHandler(async (req, res) => {
  const { userId, chatId } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    res.status(404);
    throw new Error("Chat not found");
  } else {
    res.status(200).send(updatedChat);
  }
});

const removeFromGroup = expressAsyncHandler(async (req, res) => {
  const { userId, chatId } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
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

  if (!updatedChat) {
    res.status(404);
    throw new Error("Chat not found");
  } else {
    res.status(200).send(updatedChat);
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
