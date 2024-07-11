const express = require("express");
const http = require("http");
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
const socketIo = require('socket.io');

const PORT = process.env.PORT || 3001;

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
  },
  // parser: customParser, // TODO: enable parser
});

const handlers = new Map(Object.entries({
  'join-room': joinRoom,
  'leave-room': leaveRoom,
  'send-message': sendMessage,
  'up-vote': upVote,
  'down-vote': downVote,
}));

const handlerProcessor = (socket, name, handler) => {
  try {
    return handler(socket);
  } catch(e) {
    errorLogger.error(`Error on: ${name}`, e);
  }
};

io.on("connection", (socket) => {
  activityLogger.info(`New connection: ${socket.id}`);
  for (let [name, handler] of handlers) {
    socket.on(name, handlerProcessor(socket, name, handler))
  }

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

module.exports = { server, io };