const Message = require("../Models/Message");
const mongoose = require("mongoose");
const ObjectId = mongoose.mongo.ObjectId;

let room_under_use = {};

exports.joinRoom = (socket, username, group_id) => {
  // if (!doesUserInRoom(username, group_id)) {
  //     socket.join(group_id);
  //     if(!room_under_use.hasOwnProperty(group_id))
  //         room_under_use[group_id] = [];
  //     room_under_use[group_id].push(username);
  //     console.log(room_under_use);
  //     console.log(username + " is active in the group " + group_id);
  // }
  socket.join(group_id);
  console.log(username + " is active in the group " + group_id);
};

exports.leaveRoom = (socket, username, group_id) => {
  if (doesUserInRoom(username, group_id)) {
    socket.leave(group_id);
    const index = room_under_use[group_id].indexOf(username);
    console.log(index);
    room_under_use[group_id].splice(index, 1);
    console.log(room_under_use);
    console.log(username + " is deactivated from the group " + group_id);
  }
};

exports.sendMessage = async (
  group_id,
  senderPhoto,
  senderName,
  msg, 
  mediaLink,
  sent_at
) => {
  // const message = await Message.create({
  //   group_id: new ObjectId(group_id),
  //   senderName: senderName,
  //   senderPhoto: senderPhoto,
  //   msg: msg,
  //   sent_at: sent_at,
  //   mediaLink: mediaLink,
  //   read_by: room_under_use[group_id],
  // });
};

const doesUserInRoom = (user, room) => {
  if (room_under_use.hasOwnProperty(room)) {
    if (room_under_use[room].includes(user)) return true;
  }
  return false;
};

exports.upVote = async (msg_id) => {
  await Message.updateOne(
    { _id: new ObjectId(msg_id) },
    { $inc: { votes: 1 } }
  );
};

exports.downVote = async (msg_id) => {
  await Message.updateOne(
    { _id: new ObjectId(msg_id) },
    { $inc: { votes: -1 } }
  );
};
