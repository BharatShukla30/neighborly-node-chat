const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const connectDatabase = require("./config/database");
const dotenv = require("dotenv");
const customParser = require("socket.io-msgpack-parser");
dotenv.config({ path: "./config/config.env" });
const {
  joinRoom,
  leaveRoom,
  sendMessage,
  upVote,
  downVote,
} = require("./controllers/chatController");
const { activityLogger, errorLogger } = require("./utils/logger");

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
  parser: customParser,
});

// Connect to the database
connectDatabase();

const PORT = process.env.PORT || 3001;

io.on("connection", (socket) => {
  activityLogger.info(`New connection: ${socket.id}`);

  socket.on("join-room", ({ username, group_id }) => {
    try {
      joinRoom(socket, username, group_id);
      activityLogger.info(`User ${username} joined room ${group_id}`);
    } catch (error) {
      errorLogger.error("Error joining room", error);
    }
  });

  socket.on("leave-room", ({ username, group_id }) => {
    try {
      leaveRoom(socket, username, group_id);
      activityLogger.info(`User ${username} left room ${group_id}`);
    } catch (error) {
      errorLogger.error("Error leaving room", error);
    }
  });

  socket.on(
    "send-message",
    async ({ group_id, senderName, senderPhoto, msg, sent_at, mediaLink }) => {
      try {
        await sendMessage(
          group_id,
          senderPhoto,
          senderName,
          msg,
          mediaLink,
          sent_at
        );

        console.log("Emitting receive_message event with data:", {
          group_id,
          senderName,
          msg,
          sent_at,
          mediaLink,
          senderPhoto,
        });

        socket.to(group_id).emit("receive_message", {
          group_id: group_id,
          senderName: senderName,
          msg: msg,
          sent_at: sent_at,
          mediaLink: mediaLink,
          senderPhoto: senderPhoto,
        });
        activityLogger.info(
          `Message sent in room ${group_id} by ${senderName}`
        );
      } catch (error) {
        errorLogger.error("Error sending message", error);
      }
    }
  );

  socket.on("up-vote", async ({ msg_id }) => {
    try {
      await upVote(msg_id);
      activityLogger.info(`Message ${msg_id} up-voted`);
    } catch (error) {
      errorLogger.error("Error up-voting message", error);
    }
  });

  socket.on("down-vote", async ({ msg_id }) => {
    try {
      await downVote(msg_id);
      activityLogger.info(`Message ${msg_id} down-voted`);
    } catch (error) {
      errorLogger.error("Error down-voting message", error);
    }
  });

  socket.on("error", (error) => {
    errorLogger.error("Socket.IO error", error);
  });

  socket.on("disconnect", (reason) => {
    activityLogger.info(`Socket ${socket.id} disconnected: ${reason}`);
  });
});

server.listen(PORT, () => {
  activityLogger.info(`Server listening on port ${PORT}`);
});
