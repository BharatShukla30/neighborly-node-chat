const app = require('../app');
const Client = require('socket.io-client');
const customParser = require("socket.io-msgpack-parser");

jest.mock('../utils/logger');

const withParser = () => process.env.USE_PARSER
    ? { parser: customParser }
    : {};

describe('Socket.IO Server', () => {
    let clientSocket1;
    let clientSocket2

    beforeAll(() => {
        const port = process.env.PORT || 3001;
        clientSocket1 = new Client(`http://localhost:${port}`, withParser());
        clientSocket2 = new Client(`http://localhost:${port}`, withParser());
    });

    afterAll(() => {
        app.io.close();
        clientSocket1.close();
        clientSocket2.close();
    });

    test('should join a room', (done) => {
        clientSocket1.emit('join-room', { name: 'user1', groupId: 'room1' });
        setTimeout(() => {
            const rooms = Array.from(app.io.sockets.adapter.rooms.keys());
            expect(rooms).toContain('room1');
            done();
        }, 50);
    });

    test('should leave a room', (done) => {
        clientSocket1.emit('join-room', { name: 'user1', groupId: 'room2' });
        setTimeout(() => {
            clientSocket1.emit('leave-room', 'user1', 'room2');
            setTimeout(() => {
                const rooms = Array.from(app.io.sockets.adapter.rooms.keys());
                expect(rooms).not.toContain('room2');
                done();
            }, 50);
        }, 50);
    });

    test('should send a message', (done) => {
        const message = {
            messageId: 1,
            groupId: 'room1',
            senderPhoto: 'photo.png',
            name: 'user1',
            message: 'Hello',
            mediaLink: '',
            timestamps: new Date(),
        };

        clientSocket1.emit('join-room', { name: 'user1', groupId: 'room1' });
        clientSocket2.emit('join-room', { name: 'user2', groupId: 'room1' });

        clientSocket2.on('receive_message', (msg) => {
            expect(msg.messageId).toEqual(message.messageId);
            done();
        });

        setTimeout(() => {
            clientSocket1.emit('send-message', message);
        }, 50);
    });

    test('should handle up-vote', (done) => {
        clientSocket2.on('up-vote_receive', (data) => {
            expect(data.messageId).toBe(1);
            done();
        });

        setTimeout(() => {
            clientSocket1.emit('up-vote', { groupId: 'room1', messageId: 1 });
        }, 50);
    });

    test('should handle down-vote', (done) => {
        clientSocket2.on('down-vote_receive', (data) => {
            expect(data.messageId).toBe(1);
            done();
        });

        setTimeout(() => {
            clientSocket1.emit('down-vote', { groupId: 'room1', messageId: 1 });
        }, 50);
    });
});
