import React, { useState, useMemo } from 'react';
import io from 'socket.io-client';
import "./App.css";
import Chat from "./Chat";


const socket = io('http://localhost:3001'); // Adjust the URL accordingly

function App() {
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');
  const [roomList, setRoomList] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [alreadyExist, setAlreadyExist] = useState(false);

  const joinRoom = () => {
    if (username.trim() !== '' && room.trim() !== '') {
      socket.emit('join-room', { username, room });
      setShowChat(true);
    }
  };
  
  const leaveRoom = () => {
    console.log('leave-room')
    if (username.trim() !== '' && room.trim() !== '') {
      socket.emit('leave-room', { username, room });
    }
  };

  useMemo(() => {
    
    // Fetch the list of available rooms when the component mounts
    socket.emit('get-room-list');

    // Listen for the list of available rooms
    socket.on('room-list', (rooms) => {
      setRoomList(rooms);
    });

    socket.on('already-exists', () => {
      setAlreadyExist(true);
    });

  }, [username, room]);


  return (
    <div className="App">
    {!showChat ? (
      <div>
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
      </div>
    ) : (
      alreadyExist ? (
        <div>
          <h1>User already exists in the room.</h1>
        </div>
      ) : (
        <Chat socket={socket} username={username} room={room} />
      )
    )}
    
    </div>
  );
}

export default App;
