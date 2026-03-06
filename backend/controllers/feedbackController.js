const Feedback = require('../models/Feedback');

// @desc    Create new feedback
// @route   POST /api/feedback
// @access  Public
const createFeedback = async (req, res) => {
  try {

    const { name, email, message } = req.body;

    const feedback = new Feedback({
      name,
      email,
      message,
    });

    const createdFeedback = await feedback.save();
    res.status(201).json(createdFeedback);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all feedback
// @route   GET /api/feedback
// @access  Private/Admin
const getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({}).sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Mark feedback as resolved
// @route   PATCH /api/feedback/:id
// @access  Private/Admin
const markResolved = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (feedback) {
      feedback.status = 'resolved';
      const updatedFeedback = await feedback.save();
      res.json(updatedFeedback);
    } else {
      res.status(404).json({ message: 'Feedback not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a feedback
// @route   DELETE /api/feedback/:id
// @access  Private/Admin
const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);

    if (feedback) {
      res.json({ message: 'Feedback removed' });
    } else {
      res.status(404).json({ message: 'Feedback not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  createFeedback,
  getFeedbacks,
  markResolved,
  deleteFeedback,
};
