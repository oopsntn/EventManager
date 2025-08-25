// models/Event.js
const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  startTime: { type: Date, required: true },
  endTime: { 
    type: Date, 
    required: true,
    validate: {
      validator: function(value) {
        return value > this.startTime;
      },
      message: "End time must be after start time."
    }
  },
  location: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  maxParticipant: { type: Number },
  status: { type: String, enum: ["upcoming", "ongoing", "ended", "cancelled"], default: "upcoming" },
  eventCategoryIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "EventCategory" }]
});

module.exports = mongoose.model("Event", eventSchema);
