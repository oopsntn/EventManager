// controllers/registration.controller.js
const Registration = require("../models/registration");
const Event = require("../models/event");
const notificationController = require("./notification.controller");

// Create: đăng ký tham gia
exports.registerEvent = async (req, res) => {
  try {
    const { userId, eventId } = req.body;
    console.log("📌 Register request:", { userId, eventId }); // log ra

    if (!userId || !eventId) {
      return res.status(400).json({ message: "Thiếu userId hoặc eventId" });
    }
    const event = await Event.findById(eventId);
    // check tồn tại
    const exists = await Registration.findOne({ userId, eventId });
    if (exists) {
      return res.status(400).json({ message: "Bạn đã đăng ký sự kiện này rồi" });
    }

    const registration = new Registration({ userId, eventId });
    await registration.save();
    try {
      await notificationController.createEventRegistrationNotification(req, userId, eventId, event.title);
      console.log(`✅ Notification sent to user ${userId} for event: ${event.title}`);
    } catch (notificationError) {
      console.error('❌ Error sending notification:', notificationError);
    }

    res.status(201).json({ message: "Đăng ký thành công", registration });
  } catch (err) {
    res.status(500).json({ message: "Error registering", error: err.message });
  }
};

// Read: xem sự kiện đã đăng ký
exports.getUserRegistrations = async (req, res) => {
  try {
    const { userId } = req.params;

    const registrations = await Registration.find({ userId })
      .populate({
        path: "eventId",
        populate: { path: "eventCategoryIds", select: "name" }, // lấy tên category
      });

    // tính số người tham gia từ bảng Registration
    const withParticipants = await Promise.all(
      registrations.map(async (reg) => {
        const count = await Registration.countDocuments({ eventId: reg.eventId._id });
        return {
          ...reg.toObject(),
          eventId: {
            ...reg.eventId.toObject(),
            participants: count, // thêm field participants
          },
        };
      })
    );

    res.json(withParticipants);
  } catch (err) {
    res.status(500).json({ message: "Error fetching registrations", error: err.message });
  }
};



// Delete: hủy đăng ký
exports.cancelRegistration = async (req, res) => {
  try {
    const { userId, eventId } = req.body;
    await Registration.findOneAndDelete({ userId, eventId });
    res.json({ message: "Hủy đăng ký thành công" });
    const event = await Event.findById(eventId);
    try {
      await notificationController.createEventCancellationNotification(req, userId, eventId, event.title);
      console.log(`✅ Notification sent to user ${userId} for event: ${event.title}`);
    } catch (notificationError) {
      console.error('❌ Error sending notification:', notificationError);
    }
  } catch (err) {
    res.status(500).json({ message: "Error cancelling registration", error: err.message });
  }
};
