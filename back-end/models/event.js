// models/Event.js
const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  location: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  maxParticipant: { type: Number },
  status: { type: String, enum: ["upcoming", "ongoing", "ended", "cancelled"], default: "upcoming" },
  eventCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: "EventCategory" }
});

module.exports = mongoose.model("Event", eventSchema);
