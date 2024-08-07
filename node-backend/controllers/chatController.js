const { activityLogger } = require("../utils/logger");
const messageAPI = process.env.API_ENDPOINT + process.env.MESSAGE_STORE;
const rooms = new Map();

const pushUserIntoRoom = (username, groupId) => {
  if (rooms.has(groupId)) {
    const room = rooms.get(groupId);
    room.push(username);
    rooms.set(groupId, room);
  } else {
    rooms.set(groupId, [username]);
  }
};

const subUserFromRoom = (username, groupId) => {
  const room = rooms.get(groupId);
  const index = room.indexOf(username);
  if (index > -1) {
    room.splice(index, 1);
    rooms.set(groupId, room);
  }
};

const isUserInRoom = (username, groupId) => {
  if (rooms.has(groupId)) {
    return rooms.get(groupId).includes(username);
  }
  return false;
};

exports.joinRoom =
  (socket) =>
  ({ name, groupId }) => {
    if (!isUserInRoom(name, groupId)) {
      pushUserIntoRoom(name, groupId);
      socket.join(groupId);
      activityLogger.info(name + " is active in the group " + groupId);
    }
  };

exports.leaveRoom = (socket) => (name, groupId) => {
  if (isUserInRoom(name, groupId)) {
    subUserFromRoom(name, groupId);
    socket.leave(groupId);
    activityLogger.info(`User ${name} left room ${groupId}`);
  }
};

exports.sendMessage = (socket) => async (request) => {
  const { ...msg } = request;
  const formData = new FormData();
  formData.append("groupId", msg.group_id);
  formData.append("message", msg.msg);
  if (msg.mediaLink) formData.append("file", msg.mediaLink);
  await fetch(messageAPI, {
    method: "POST",
    body: formData,
    headers: {
      authorization: "Bearer " + msg.accessToken,
      Cookie: "refreshToken=" + msg.refreshToken,
    },
  });
  socket.to(msg.group_id).emit("receive_message", msg);
  activityLogger.info(
    `Message sent in room ${msg.group_id} by ${msg.senderName}`
  );
};

exports.upVote =
  (socket) =>
  ({ groupId, messageId }) => {
    activityLogger.info(`Message ${messageId} up-voted`);
    socket.to(groupId).emit("up-vote_receive", {
      messageId,
    });
  };

exports.downVote =
  (socket) =>
  ({ groupId, messageId }) => {
    activityLogger.info(`Message ${messageId} down-voted`);
    socket.to(groupId).emit("down-vote_receive", {
      messageId,
    });
  };
