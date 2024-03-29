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
    socket.on("join-room", ({username, group_id}) => {
      joinRoom(socket, username, group_id);
    });
  //-----------------------------------------------------------------------------------------------------------------------------------------

  //---------------------------------------------- To deactivate a user from a specific group chat ------------------------------------------
  socket.on('leave-room', ({ username, group_id }) => {
    leaveRoom(socket, username, group_id);
  });
  //-----------------------------------------------------------------------------------------------------------------------------------------

  //---------------------------------------------- Sending message --------------------------------------------------------------------------
  socket.on('send-message', async ({group_id, senderName, msg, time}) => {
    await sendMessage(group_id, senderName, msg, time);
    socket.to(group_id).emit('receive_message', {group_id: group_id, senderName: senderName, msg: msg, time: time} );
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
