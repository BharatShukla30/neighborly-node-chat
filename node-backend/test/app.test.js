const app = require('../app');
const Client = require('socket.io-client');

jest.mock('../utils/logger');

describe('Socket.IO Server', () => {
    let clientSocket1;
    let clientSocket2

    beforeAll(() => {
        const port = process.env.PORT || 3001;
        clientSocket1 = new Client(`http://localhost:${port}`);
        clientSocket2 = new Client(`http://localhost:${port}`);
    });

    afterAll(() => {
        app.io.close();
        clientSocket1.close();
        clientSocket2.close();
    });

    test('should join a room', (done) => {
        clientSocket1.emit('join-room', { username: 'user1', group_id: 'room1' });
        setTimeout(() => {
            const rooms = Array.from(app.io.sockets.adapter.rooms.keys());
            expect(rooms).toContain('room1');
            done();
        }, 50);
    });

    test('should leave a room', (done) => {
        clientSocket1.emit('join-room', { username: 'user1', group_id: 'room2' });
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
            msg_id: 1,
            group_id: 'room1',
            senderPhoto: 'photo.png',
            senderName: 'user1',
            msg: 'Hello',
            mediaLink: '',
            sent_at: new Date(),
        };

        clientSocket1.emit('join-room', { username: 'user1', group_id: 'room1' });
        clientSocket2.emit('join-room', { username: 'user2', group_id: 'room1' });

        clientSocket2.on('receive_message', (msg) => {
            expect(msg.msg_id).toEqual(message.msg_id);
            done();
        });

        setTimeout(() => {
            clientSocket1.emit('send-message', message);
        }, 50);
    });

    test('should handle up-vote', (done) => {
        clientSocket2.on('up-vote_receive', (data) => {
            expect(data.msg_id).toBe(1);
            done();
        });

        setTimeout(() => {
            clientSocket1.emit('up-vote', { group_id: 'room1', msg_id: 1 });
        }, 50);
    });

    test('should handle down-vote', (done) => {
        clientSocket2.on('down-vote_receive', (data) => {
            expect(data.msg_id).toBe(1);
            done();
        });

        setTimeout(() => {
            clientSocket1.emit('down-vote', { group_id: 'room1', msg_id: 1 });
        }, 50);
    });
});
