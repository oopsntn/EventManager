// controllers/home.controller.js
const Event = require("../models/event");
const Registration = require("../models/registration");

// Lấy tất cả event kèm số người đã đăng ký
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().lean();

    const eventsWithParticipants = await Promise.all(
      events.map(async (event) => {
        const count = await Registration.countDocuments({ eventId: event._id });
        return {
          ...event,
          participants: count,
        };
      })
    );

    res.json(eventsWithParticipants);
  } catch (err) {
    res.status(500).json({ message: "Error fetching events", error: err.message });
  }
};
// Lấy chi tiết 1 event

exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.query.userId; // nhận userId từ query string
    const event = await Event.findById(id)
      .populate("eventCategoryIds", "name description")
      .lean();

    if (!event) return res.status(404).json({ message: "Không tìm thấy sự kiện" });

    const count = await Registration.countDocuments({ eventId: event._id });

    let isRegistered = false;
    if (userId) {
      isRegistered = await Registration.exists({ eventId: event._id, userId });
    }

    res.json({ ...event, participants: count, isRegistered });
  } catch (err) {
    res.status(500).json({ message: "Error fetching event", error: err.message });
  }
};


