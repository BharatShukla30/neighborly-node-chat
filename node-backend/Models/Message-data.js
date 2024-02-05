const mongoose = require("mongoose");

const message = new mongoose.Schema({
    room: {
        type: String,
        required: [true, "Please enter room name"]
    },
    sender: {
        type: String,
        required: [true, "Please enter sender detail"]
    },
    message: {
        type: String
    },
    time: {
        type: Date,
        required: [true, "Please provide timestamp"]
    }
});

module.exports = mongoose.model("Message", message);