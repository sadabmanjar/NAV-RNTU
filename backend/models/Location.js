const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    required: true,
  },
  coordinates: {
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    }
  },
  image: {
    type: String,
  },
  visits: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Location', locationSchema);
