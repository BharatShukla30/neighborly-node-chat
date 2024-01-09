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
let usersInRooms = {};

const userExists = (user, room) => {
  if (usersInRooms.hasOwnProperty(room) && usersInRooms[room].has(user)) {
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
    if (!userExists(username, room)) {
      if (usersInRooms.hasOwnProperty(room)) {
        usersInRooms[room].add(username); // Use Set's add method to add a user
      } else {
        usersInRooms[room] = new Set([username]); // Create a new Set with the initial user
      }
      socket.join(room);
      console.log(`${username} joined ${room}`);
    } else {
      console.log(`${username} already exists in ${room}`);
      socket.emit('already-exists');
    }
  });

  socket.on('leave-room', ({ username, room }) => {
    if (userExists(username, room)) {
      usersInRooms[room].delete(username); // Use delete method to remove a user from the Set
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
