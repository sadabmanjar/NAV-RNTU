const express = require('express');
const router = express.Router();
const {
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation,
  recordVisit,
} = require('../controllers/locationController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(getLocations)
  .post(protect, createLocation);

router.route('/:id')
  .put(protect, updateLocation)
  .delete(protect, deleteLocation);

router.post('/:id/visit', recordVisit);

module.exports = router;
