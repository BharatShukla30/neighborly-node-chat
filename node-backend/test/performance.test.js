const { check } = require('k6');
const ws = require('k6/ws');
const { sleep } = require('k6');

exports.options = {
    stages: [
        { duration: '1m', target: 100 }, // Ramp up to 100 users over 1 minute
        { duration: '3m', target: 100 }, // Stay at 100 users for 3 minutes
        { duration: '1m', target: 0 },   // Ramp down to 0 users over 1 minute
    ],
};

exports.default = function () {
    const url = 'ws://localhost:5001/socket.io/?EIO=4&transport=websocket';
    const params = { tags: { my_tag: 'hello' } };

    const response = ws.connect(url, params, function (socket) {
        socket.on('open', function () {
            console.log('connected');

            // Join room
            socket.send(JSON.stringify({ type: 'join-room', data: { username: `user${__VU}`, group_id: 'test-room' } }));

            // Send a message
            socket.send(JSON.stringify({
                type: 'send-message',
                data: {
                    group_id: 'test-room',
                    senderName: `user${__VU}`,
                    senderPhoto: 'test-photo-url',
                    msg: 'Hello, world!',
                    sent_at: new Date(),
                    mediaLink: 'test-media-link',
                },
            }));

            // Up-vote
            socket.send(JSON.stringify({ type: 'up-vote', data: { msg_id: 'test-message-id' } }));

            // Down-vote
            socket.send(JSON.stringify({ type: 'down-vote', data: { msg_id: 'test-message-id' } }));

            // Leave room
            socket.send(JSON.stringify({ type: 'leave-room', data: { username: `user${__VU}`, group_id: 'test-room' } }));

            // Wait for a while
            sleep(1);
            socket.close();
        });

        socket.on('close', function () {
            console.log('disconnected');
        });
    });

    check(response, { 'status is 101': (r) => r && r.status === 101 });
}
