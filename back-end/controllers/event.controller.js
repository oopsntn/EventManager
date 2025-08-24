const Event = require("../models/event");
const EventCategory = require("../models/eventCategory");
const Registration = require("../models/registration");
const Notification = require("../models/notification");
const Organizer = require("../models/organizer");
const User = require("../models/user");
const mongoose = require("mongoose");
const { createEventRegistrationNotification } = require('./notification.controller');

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

// Lấy events mà user là organizer
exports.getMyEvents = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Tìm events mà user là organizer
    const organizers = await Organizer.find({ userId: userId });
    const eventIds = organizers.map(org => org.eventId);
    
    const events = await Event.find({ _id: { $in: eventIds } })
      .populate("eventCategoryIds", "name description")
      .sort({ startTime: -1 });

    const eventList = events.map(event => ({
      id: event._id,
      title: event.title,
      description: event.description,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
      createdAt: event.createdAt,
      maxParticipant: event.maxParticipant,
      status: event.status,
      categories: event.eventCategoryIds.map(cat => ({
        id: cat._id,
        name: cat.name,
        description: cat.description
      }))
    }));

    return res.json(eventList);
  } catch (error) {
    console.error('Get my events error:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getEventDetail = async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId)
      .populate("eventCategoryIds", "name description");

    if (!event) return res.status(404).json({ message: "Event not found" });

    // Đếm số người đăng ký (đã xác nhận hoặc đang chờ, tùy business rule)
    const participantCount = await Registration.countDocuments({
      eventId: eventId,
      status: { $in: ["pending", "confirmed"] }
    });

    const eventDetail = {
      id: event._id,
      title: event.title,
      description: event.description,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
      createdAt: event.createdAt,
      maxParticipant: event.maxParticipant,
      status: event.status,
      categories: event.eventCategoryIds.map(cat => ({
        id: cat._id,
        name: cat.name,
        description: cat.description
      })),
      currentParticipant: participantCount
    };

    return res.json(eventDetail);
  } catch (error) {
    console.error('Get event detail error:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Lấy danh sách đăng ký của một event
exports.getEventRegistrations = async (req, res) => {
  try {
    const { id } = req.params;
    
    const registrations = await Registration.find({ eventId: id })
      .populate("userId", "name email phone")
      .sort({ registeredAt: -1 });

    const registrationList = registrations.map(reg => ({
      id: reg._id,
      user: {
        id: reg.userId._id,
        name: reg.userId.name,
        email: reg.userId.email,
        phone: reg.userId.phone
      },
      eventId: reg.eventId,
      registeredAt: reg.registeredAt,
      status: reg.status
    }));

    return res.json(registrationList);
  } catch (error) {
    console.error('Get event registrations error:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Cập nhật trạng thái đăng ký
exports.updateRegistrationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const registration = await Registration.findByIdAndUpdate(
      id, 
      { status: status }, 
      { new: true }
    );

    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }

    return res.json({ 
      message: "Registration status updated successfully", 
      registration 
    });
  } catch (error) {
    console.error('Update registration status error:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Tạo mới event
exports.createEvent = async (req, res) => {
  try {
    const data = req.body;
    const event = new Event(data);
    await event.save();
    
    // Tạo organizer record
    if (data.organizerId) {
      const organizer = new Organizer({
        userId: data.organizerId,
        eventId: event._id
      });
      await organizer.save();
      await createEventRegistrationNotification(req, data, event.title);
    }
    
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
    
    // Xóa event
    const event = await Event.findByIdAndDelete(id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    
    // Xóa organizer records
    await Organizer.deleteMany({ eventId: id });
    
    // Xóa registrations
    await Registration.deleteMany({ eventId: id });
    
    // Xóa notifications
    await Notification.deleteMany({ eventId: id });
    
    return res.json({ message: "Event deleted successfully" });
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
