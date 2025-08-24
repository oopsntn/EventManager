// models/EventCategory.js
const mongoose = require("mongoose");

const eventCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { collection: "eventCategories" });

module.exports = mongoose.model("EventCategory", eventCategorySchema);
