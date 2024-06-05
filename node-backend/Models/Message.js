// messageModel.js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  group_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    required: true,
  },
  senderName: {
    type: String,
    required: true,
  },
  senderPhoto: {
    type: String,
    required: true,
  },
  msg: {
    type: String,
    validate: {
      validator: function (v) {
        // Only validate msg if mediaLink is not present
        return this.mediaLink || v;
      },
      message: "Either message text or media link is required.",
    },
  },
  sent_at: {
    type: Date,
    default: Date.now,
  },
  read_by: [
    {
      type: String,
      required: true,
    },
  ],
  mediaLink: {
    type: String,
    validate: {
      validator: function (v) {
        // Only validate mediaLink if msg is not present
        return this.msg || v;
      },
      message: "Either message text or media link is required.",
    },
  },
  votes: {
    type: Number,
    default: 0,
  },
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
