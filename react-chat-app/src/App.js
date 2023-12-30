import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';




const socket = io('http://localhost:3001'); // Adjust the URL accordingly

function App() {
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [roomList, setRoomList] = useState([]);

  const joinRoom = () => {
    if (username.trim() !== '' && room.trim() !== '') {
      socket.emit('join-room', { username, room });
    }
  };
  
  const leaveRoom = () => {
    console.log('leave-room')
    if (username.trim() !== '' && room.trim() !== '') {
      socket.emit('leave-room', { username, room });
    }
  };

  useEffect(() => {
    
    // Fetch the list of available rooms when the component mounts
    socket.emit('get-room-list');

    // Listen for the list of available rooms
    socket.on('room-list', (rooms) => {
      setRoomList(rooms);
    });

    // Listen for messages from the server
    socket.on('chat-message', (data) => {
      setChat((prevChat) => [...prevChat, data]);
    });

    // return () => {
    //   // Cleanup: leave the room when the component unmounts
    //   // socket.emit('leave-room', { username, room });
    //  // socket.off('chat-message');
    // };
  }, [username, room]);

  const sendMessage = () => {
    if (message.trim() !== '') {
      socket.emit('chat-message', { username, message, room });
      setMessage('');
    }
  };

  return (
    <div className="App">
      <h1>Chat App</h1>

      <div>
        <label>Username:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div>
        <label>Select Room:</label>
        <select value={room} onChange={(e) => setRoom(e.target.value)}>
          <option value="">Choose a room</option>
          {roomList.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <div>
        <button onClick={joinRoom}>Join Room</button>
      </div>
      <div>
        <button onClick={leaveRoom}>Leave Room</button>
      </div>

      <div className="chat-container">
        <div className="chat-room">
          <h2>Room: {room}</h2>
          <ul>
            {chat.map((entry, index) => (
              <li key={index}>
                <strong>{entry.username}:</strong> {entry.message}
              </li>
            ))}
          </ul>
        </div>
      </div>

    </div>
  );
}

export default App;
