const mongoose = require('mongoose');

const searchQuerySchema = new mongoose.Schema({
  query: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  count: {
    type: Number,
    default: 1,
  }
}, { timestamps: true });

// Prevent duplicate query entries. We will update the count if a query already exists.
searchQuerySchema.index({ query: 1 }, { unique: true });

module.exports = mongoose.model('SearchQuery', searchQuerySchema);
