// models/Order.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  registrationId: { type: mongoose.Schema.Types.ObjectId, ref: "Registration" },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ["momo", "vnpay", "credit_card", "cash"], default: "momo" },
  status: { type: String, enum: ["PENDING", "PAID", "FAILED", "REFUNDED"], default: "PENDING" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", orderSchema);
