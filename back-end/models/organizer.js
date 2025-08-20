// models/Organizer.js
const mongoose = require("mongoose");

const organizerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true }
});

module.exports = mongoose.model("Organizer", organizerSchema);
