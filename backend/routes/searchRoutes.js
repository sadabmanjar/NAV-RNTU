const express = require('express');
const router = express.Router();
const SearchQuery = require('../models/SearchQuery');

// @desc    Record a new search query or increment existing count
// @route   POST /api/search/record
// @access  Public
router.post('/record', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: 'Invalid query string' });
    }

    const trimmedQuery = query.trim().toLowerCase();
    
    // Find and update count if exists, or create new if it doesn't. (Upsert)
    const result = await SearchQuery.findOneAndUpdate(
        { query: trimmedQuery },
        { $inc: { count: 1 } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server Error recording search', error: error.message });
  }
});

// @desc    Get Top 5 Search Queries
// @route   GET /api/search/top
// @access  Public (for Dashboard rendering)
router.get('/top', async (req, res) => {
    try {
        const topQueries = await SearchQuery.find()
            .sort({ count: -1 })
            .limit(5);

        // Format for dashboard map [{text: '"Query"', count: 10}]
        const formatted = topQueries.map(q => ({
            text: `"${q.query}"`,
            count: q.count
        }));

        res.status(200).json(formatted);
    } catch (error) {
       res.status(500).json({ message: 'Server Error fetching top searches', error: error.message });
    }
});

module.exports = router;
