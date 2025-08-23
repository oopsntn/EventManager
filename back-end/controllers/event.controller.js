const Event = require("../models/event");
const EventCategory = require("../models/eventCategory");
const Registration = require("../models/registration");
const mongoose = require("mongoose");
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find({}, "title startTime endTime location")
      .sort({ startTime: -1 });

    const eventList = events.map(event => ({
      id: event._id,
      title: event.title,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location
    }));

    return res.json(eventList);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getEventDetail = async (req, res) => {
  try {
    const event = await Event.findOne({ id: "64a1f0033333333333333004" });

    // if (!event) return res.status(404).json({ message: "Event not found" });

    // // Đếm số người đăng ký (đã xác nhận hoặc đang chờ, tùy business rule)
    // const participantCount = await Registration.countDocuments({
    //   eventId: eventId,
    //   status: { $in: ["pending", "confirmed"] }
    // });

    // const eventDetail = {
    //   id: event._id,
    //   title: event.title,
    //   description: event.description,
    //   startTime: event.startTime,
    //   endTime: event.endTime,
    //   location: event.location,
    //   createdAt: event.createdAt,
    //   maxParticipant: event.maxParticipant,
    //   status: event.status,
    //   categories: event.eventCategoryIds,
    //   currentParticipant: participantCount
    // };

    return res.json(event);
  } catch (error) {
    console.error('Get event detail error:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Tạo mới event
exports.createEvent = async (req, res) => {
  try {
    const data = req.body;
    const event = new Event(data);
    await event.save();
    return res.status(201).json({ message: "Event created", id: event._id });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(400).json({ message: "Create event failed", error: error.message });
  }
};

// Cập nhật event
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const event = await Event.findByIdAndUpdate(id, updateData, { new: true });
    if (!event) return res.status(404).json({ message: "Event not found" });
    return res.json({ message: "Event updated", event });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(400).json({ message: "Update event failed", error: error.message });
  }
};

// Xóa event
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByIdAndDelete(id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    return res.json({ message: "Event deleted" });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(400).json({ message: "Delete event failed", error: error.message });
  }
};


exports.getEventCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Missing eventCategoryId" });

    // Kiểm tra id hợp lệ
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid eventCategoryId" });
    }

    const category = await EventCategory.findById(id);

    if (!category) return res.status(404).json({ message: "EventCategory not found" });

    res.json(category);
  } catch (error) {
    console.error("Get eventCategory by id error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
