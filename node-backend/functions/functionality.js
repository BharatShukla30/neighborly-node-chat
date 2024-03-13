const Message = require('../Models/Message-data');
const mongoose = require("mongoose");
const ObjectId = mongoose.mongo.ObjectId;

let room_under_use = {};

exports.joinRoom = (socket, username, group_id) => {
    if (!doesUserInRoom(username, group_id)) {
        socket.join(group_id);
        if(!room_under_use.hasOwnProperty(group_id))
            room_under_use[group_id] = [];
        room_under_use[group_id].push(username);
        console.log(room_under_use);
        console.log(username + " is active in the group " + group_id);
    }
}

exports.leaveRoom = (socket, username, group_id) => {
    if(doesUserInRoom(username, group_id)) {
        socket.leave(group_id);
        const index = room_under_use[group_id].indexOf(username);
        console.log(index);
        room_under_use[group_id].splice(index, 1);
        console.log(room_under_use);
        console.log(username + " is deactivated from the group " + group_id);
    }
}

exports.sendMessage = async(group_id, senderName, msg, time) => {
    const message = await Message.create({
        group_id: new ObjectId(group_id),
        senderName: senderName,
        msg: msg,
        sent_at: new Date(time),
        read_by: room_under_use[group_id]
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