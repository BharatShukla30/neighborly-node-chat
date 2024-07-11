const {activityLogger} = require("../utils/logger");

const rooms = new Map();

const pushUserIntoRoom = (username, group_id) => {
  if (rooms.has(group_id)) {
    const room = rooms.get(group_id);
    room.push(username);
    rooms.set(group_id, room);
  } else {
    rooms.set(group_id, [username]);
  }
};

const subUserFromRoom = (username, group_id) => {
  const room = rooms.get(group_id);
  const index = room.indexOf(5);
  if (index > -1) {
    room.splice(index, 1);
    rooms.set(group_id, room);
  }
}

const isUserInRoom = (username, group_id) => {
  if (rooms.has(group_id)) {
    return rooms.get(group_id).includes(username);
  }
  return false;
};

exports.joinRoom = (socket) => ({ username, group_id }) => {
  if (!isUserInRoom(username, group_id)) {
    pushUserIntoRoom(username, group_id);
    socket.join(group_id);
    activityLogger.info(username + " is active in the group " + group_id);
  }
};

exports.leaveRoom = (socket) => (username, group_id) => {
  if (isUserInRoom(username, group_id)) {
    subUserFromRoom(username, group_id);
    socket.leave(group_id);
    activityLogger.info(`User ${username} left room ${group_id}`);
  }
};

exports.sendMessage = (socket) => (
    {
      msg_id,
      group_id,
      senderPhoto,
      senderName,
      msg,
      mediaLink,
      sent_at
    }
) => {
  socket.to(group_id).emit("receive_message", {
    msg_id,
    group_id: group_id,
    senderName: senderName,
    msg: msg,
    sent_at: sent_at,
    mediaLink: mediaLink,
    senderPhoto: senderPhoto,
  });
  activityLogger.info(
      `Message sent in room ${group_id} by ${senderName}`
  );
};

exports.upVote = (socket) => ({group_id, msg_id}) => {
  activityLogger.info(`Message ${msg_id} up-voted`);
  socket.to(group_id).emit("up-vote_receive", {
    msg_id,
  });
};

exports.downVote = (socket) => ({group_id, msg_id}) => {
  activityLogger.info(`Message ${msg_id} down-voted`);
  socket.to(group_id).emit("down-vote_receive", {
    msg_id,
  });
};
