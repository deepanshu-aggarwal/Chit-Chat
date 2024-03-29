const express = require("express");
const dotenv = require("dotenv");
// const { chats } = require("./data/data");
const connectDB = require("./config/db");
const colors = require("colors");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const { chats } = require("./data/data");
const Chat = require("./models/chatModel");
const morgan = require("morgan");
const path = require("path");
const serverless = require("serverless-http");

dotenv.config();

connectDB();
const app = express();

app.use(express.json()); // accept json data
// app.use(morgan("dev"));

// --------------------Deployment----------------------

// const __dirname1 = path.resolve();
// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname1, "/frontend/build")));
//   app.get("*", (req, res) => {
//     res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"));
//   });
// } else {
//   app.get("/", (req, res) => {
//     res.send("API is running successfully");
//   });
// }

// --------------------Deployment----------------------

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(`Server started on ${PORT}`.yellow.bold)
);

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  console.log("connected to socket.io");
  socket.on("setup", (userData) => {
    socket.join(userData?._id); // create a seperate socket room for that user
    socket.emit("connected"); // after that trigger connected event
  });

  socket.on("join_chat", (room) => {
    socket.join(room);
    console.log("joined", room);
  });

  socket.on("typing", (room) => {
    socket.in(room).emit("typing");
  });

  socket.on("stop_typing", (room) => {
    socket.in(room).emit("stop_typing");
  });

  socket.on("new_message", (newMessageRecieved) => {
    const chat = newMessageRecieved.chat;
    if (!chat?.users) console.log("chat.users not defined");

    chat?.users.forEach((user) => {
      if (user?._id === newMessageRecieved.sender._id) return;
      socket.in(user?._id).emit("message_recieved", newMessageRecieved);
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData?._id);
  });
});

// app.use("./netlify/functions/server", router);

module.exports.handler = serverless(app);
