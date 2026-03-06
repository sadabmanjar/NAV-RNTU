const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  eventType: { type: String, default: 'Other' },
  date: { type: Date, required: true },
  time: { type: String, default: '' },
  locationName: { type: String, required: true },
  coordinates: {
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
