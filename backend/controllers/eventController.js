const Event = require('../models/Event');

// @desc    Get all events
// @route   GET /api/events
// @access  Public (or Private if you prefer only admins to see)
const getEvents = async (req, res) => {
  try {
    const events = await Event.find({}).sort({ date: 1 }); // Sort by soonest first
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create an event
// @route   POST /api/events
// @access  Private/Admin
const createEvent = async (req, res) => {
  try {
    const { title, description, eventType, date, time, locationName, coordinates } = req.body;

    const event = new Event({
      title,
      description,
      eventType,
      date,
      time,
      locationName,
      coordinates
    });

    const createdEvent = await event.save();
    res.status(201).json(createdEvent);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private/Admin
const updateEvent = async (req, res) => {
  try {
    const { title, description, eventType, date, time, locationName, coordinates } = req.body;
    const event = await Event.findById(req.params.id);

    if (event) {
      event.title = title || event.title;
      event.description = description || event.description;
      if (eventType !== undefined) event.eventType = eventType;
      event.date = date || event.date;
      if (time !== undefined) event.time = time;
      event.locationName = locationName || event.locationName;
      event.coordinates = coordinates || event.coordinates;

      const updatedEvent = await event.save();
      res.json(updatedEvent);
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private/Admin
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (event) {
      res.json({ message: 'Event removed' });
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent
};
