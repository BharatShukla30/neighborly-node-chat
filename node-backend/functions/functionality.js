const Message = require('../Models/Message-data');

let room_under_use = {};

exports.joinRoom = (socket, user_id, group_id) => {
    if (!doesUserInRoom(user_id, group_id)) {
        socket.join(group_id);
        if(!room_under_use.hasOwnProperty(group_id))
            room_under_use[group_id] = [];
        room_under_use[group_id].push(user_id);
        console.log(room_under_use);
        console.log(user_id + " is active in the group " + group_id);
    }
}

exports.leaveRoom = (socket, user_id, group_id) => {
    if(doesUserInRoom(user_id, group_id)) {
        socket.leave(group_id);
        const index = room_under_use[group_id].indexOf(user_id);
        console.log(index);
        room_under_use[group_id].splice(index, 1);
        console.log(room_under_use);
        console.log(user_id + " is deactivated from the group " + group_id);
    }
}

exports.sendMessage = (group_id, senderId, senderName, msg, time) => {
    const readers = room_under_use[group_id].map(reader => new ObjectId(reader));
    const message = Message.create({
        group_id: new ObjectId(group_id),
        sender: {
            senderId: new ObjectId(senderId),
            senderName: senderName
        },
        msg: msg,
        sent_at: new Date(time),
        read_by: readers
    })
    console.log(message);
}

const doesUserInRoom = (user, room) => {
    if (room_under_use.hasOwnProperty(room)) {
        if (room_under_use[room].includes(user))
            return true;
    }
    return false;
};