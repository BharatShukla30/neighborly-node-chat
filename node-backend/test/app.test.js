const io = require('socket.io-client');
const dotenv = require('dotenv');
dotenv.config({ path: './config/config.env' });

const serverUrl = `http://localhost:${process.env.PORT || 3001}`;
const numClients = 100; // Number of concurrent clients
const clients = [];

beforeAll((done) => {
    for (let i = 0; i < numClients; i++) {
        const client = io(serverUrl);
        clients.push(client);

        client.on('connect', () => {
            if (clients.length === numClients) {
                done();
            }
        });

        client.on('error', (error) => {
            console.error(`Client ${i} encountered an error:`, error);
        });
    }
});

afterAll(() => {
    clients.forEach(client => client.disconnect());
});

test('Clients can join and leave rooms', (done) => {
    let joinCount = 0;
    let leaveCount = 0;

    clients.forEach((client, index) => {
        client.emit('join-room', { username: `user${index}`, group_id: 'test-room' });

        client.on('receive_message', (message) => {
            console.log('Received message:', message);
        });

        client.on('connect', () => {
            joinCount++;
            if (joinCount === numClients) {
                clients.forEach((client, idx) => {
                    client.emit('leave-room', { username: `user${idx}`, group_id: 'test-room' });
                });
            }
        });

        client.on('disconnect', () => {
            leaveCount++;
            if (leaveCount === numClients) {
                done();
            }
        });
    });
});

test('Clients can send and receive messages', (done) => {
    let messageCount = 0;
    const testMessage = {
        group_id: 'test-room',
        senderName: 'test-sender',
        senderPhoto: 'test-photo-url',
        msg: 'Hello, world!',
        sent_at: new Date(),
        mediaLink: 'test-media-link',
    };

    clients.forEach((client) => {
        client.emit('send-message', testMessage);

        client.on('receive_message', (message) => {
            messageCount++;
            expect(message.msg).toBe(testMessage.msg);
            if (messageCount === numClients) {
                done();
            }
        });
    });
});

test('Clients can up-vote messages', (done) => {
    let voteCount = 0;
    const testMessageId = 'test-message-id';

    clients.forEach((client) => {
        client.emit('up-vote', { msg_id: testMessageId });

        // Simulate a response or use a mock if needed
        setTimeout(() => {
            voteCount++;
            if (voteCount === numClients) {
                done();
            }
        }, 100);
    });
});

test('Clients can down-vote messages', (done) => {
    let voteCount = 0;
    const testMessageId = 'test-message-id';

    clients.forEach((client) => {
        client.emit('down-vote', { msg_id: testMessageId });

        // Simulate a response or use a mock if needed
        setTimeout(() => {
            voteCount++;
            if (voteCount === numClients) {
                done();
            }
        }, 100);
    });
});