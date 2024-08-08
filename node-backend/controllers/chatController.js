const { activityLogger, errorLogger } = require("../utils/logger");
const messageAPI = process.env.API_ENDPOINT + process.env.MESSAGE_STORE;
const feedbackAPI = process.env.API_ENDPOINT + process.env.CHEER_BOO;
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
  try {
    const { ...msg } = request;
    const formData = new FormData();
    formData.append("groupId", msg.group_id);
    formData.append("message", msg.msg);
    if (msg.mediaLink) formData.append("file", msg.mediaLink);
    activityLogger.info(
      formData.toString + " being sent at " + messageAPI.toString()
    );
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
  } catch (err) {
    errorLogger.error(err);
  }
};

//TODO: whenever we send a feedback we get this in console: "error: undefined {"timestamp":"08-08-2024 17:59:46"}", fix needed
exports.feedback =
  (socket) =>
  async ({ group_id, message_id, action, accessToken, refreshToken }) => {
    try {
      const payload = {
        id: message_id,
        type: "message",
        feedback: action,
      };

      activityLogger.info(
        `Feedback (${action}) for message ${message_id} starting`
      );

      const response = await fetch(feedbackAPI, {
        method: "PUT",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
          authorization: "Bearer " + accessToken,
          Cookie: "refreshToken=" + refreshToken,
        },
      });
      activityLogger.info(
        `Received response from ${feedbackAPI}: ${JSON.stringify(responseData)}`
      );
      activityLogger.info(
        `Feedback (${action}) for message ${message_id} completed.`
      );
      socket.to(group_id).emit("feedback_receive", {
        message_id,
        action,
      });
    } catch (err) {
      errorLogger.error(err);
    }
  };
