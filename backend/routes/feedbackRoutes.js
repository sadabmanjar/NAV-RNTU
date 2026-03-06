const express = require('express');
const router = express.Router();
const {
  createFeedback,
  getFeedbacks,
  markResolved,
  deleteFeedback,
} = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(createFeedback)
  .get(protect, getFeedbacks);

router.route('/:id')
  .patch(protect, markResolved)
  .delete(protect, deleteFeedback);

module.exports = router;
