const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const connectDatabase = require("./config/database");
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });
const {joinRoom, leaveRoom, sendMessage} = require("./functions/functionality")

const io = require('socket.io')(server,{
  cors:{
    origin: '*',
  }
});
connectDatabase();
const PORT = process.env.PORT || 3001;

io.on('connection',(socket) => {

  //------------------------------------------------ To activate a user in a specific group chat -------------------------------------------
    socket.on("join-room", ({user_id, group_id}) => {
      joinRoom(socket, user_id, group_id);
    });
  //-----------------------------------------------------------------------------------------------------------------------------------------

  //---------------------------------------------- To deactivate a user from a specific group chat ------------------------------------------
  socket.on('leave-room', ({ user_id, group_id }) => {
    leaveRoom(socket, user_id, group_id);
  });
  //-----------------------------------------------------------------------------------------------------------------------------------------

  //---------------------------------------------- Sending message --------------------------------------------------------------------------
  socket.on('send-message', ({group_id, senderId, senderName, msg, time}) => {
    sendMessage(group_id, senderId, senderName, msg, time);
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
