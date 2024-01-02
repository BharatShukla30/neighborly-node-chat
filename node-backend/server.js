const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const {Server} = require('socket.io');

const io = require('socket.io')(server,{
  cors:{
    origin: '*',
  }
});

const PORT = process.env.PORT || 3001;

const availableRooms = ['room1', 'room2', 'room3'];
let setOfUsers = new Set([]);

const userExists = (user) => {
  if(setOfUsers.has(user)){
    return true;
  }
  return false;
};

io.on('connection', (socket) => {
  console.log('A user connected');
  
  socket.on('get-room-list', () => {
    io.to(socket.id).emit('room-list', availableRooms);
  });

  socket.on('join-room', ({ username, room }) => {
    if (!userExists(username)){
      setOfUsers.add(username);
      socket.join(room);
      console.log(`${username} joined ${room}`);
    }
  });

  socket.on('leave-room', ({ username, room }) => {
    if(userExists(username)){
      setOfUsers.delete(username);
      socket.leave(room);
      console.log(`${username} left ${room}`);
    }
  });

  // socket.on('chat-message', ({ username, message }) => {
  //   io.to(room).emit('chat-message', { username, message });
  // });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
