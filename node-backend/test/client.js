const io = require('socket.io-client');

// Connect to the WebSocket server
const socket = io(`http://localhost:5001`);

// Handle connection events
socket.on('connect', () => {
    console.log('Connected to server');

    // Example of joining a room
    socket.emit('join-room', { username: 'testuser', group_id: 'testgroup' });

    // Example of sending a message
    socket.emit('send-message', {
        group_id: 'testgroup',
        senderName: 'testuser',
        senderPhoto: 'testphoto.jpg',
        msg: 'Hello, this is a test message!',
        sent_at: new Date().toISOString(),
        mediaLink: ''
    });

    // Example of up-voting a message
    socket.emit('up-vote', { msg_id: 'message123' });

    // Example of down-voting a message
    socket.emit('down-vote', { msg_id: 'message123' });
});

// Handle disconnection events
socket.on('disconnect', (reason) => {
    console.log('Disconnected from server:', reason);
});

// Handle custom events from the server
socket.on('receive_message', (data) => {
    console.log('Received message:', data);
});

socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
});

socket.on('error', (error) => {
    console.error('Socket error:', error);
});