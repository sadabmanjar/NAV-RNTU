const Location = require('../models/Location');

// @desc    Get all locations
// @route   GET /api/locations
// @access  Public
const getLocations = async (req, res) => {
  try {
    const locations = await Location.find({});
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a location
// @route   POST /api/locations
// @access  Private/Admin
const createLocation = async (req, res) => {
  try {
    const { name, description, category, coordinates, image } = req.body;

    const location = new Location({
      name,
      description,
      category,
      coordinates,
      image,
    });

    const createdLocation = await location.save();
    res.status(201).json(createdLocation);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update a location
// @route   PUT /api/locations/:id
// @access  Private/Admin
const updateLocation = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);

    if (location) {
      location.name = req.body.name || location.name;
      location.description = req.body.description || location.description;
      location.category = req.body.category || location.category;
      location.coordinates = req.body.coordinates || location.coordinates;
      location.image = req.body.image || location.image;

      const updatedLocation = await location.save();
      res.json(updatedLocation);
    } else {
      res.status(404).json({ message: 'Location not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a location
// @route   DELETE /api/locations/:id
// @access  Private/Admin
const deleteLocation = async (req, res) => {
  try {
    const location = await Location.findByIdAndDelete(req.params.id);

    if (location) {
      res.json({ message: 'Location removed' });
    } else {
      res.status(404).json({ message: 'Location not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Increment location visit count
// @route   POST /api/locations/:id/visit
// @access  Public
const recordVisit = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    if (location) {
      location.visits = (location.visits || 0) + 1;
      await location.save();
      res.json({ message: 'Visit recorded', visits: location.visits });
    } else {
      res.status(404).json({ message: 'Location not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation,
  recordVisit,
};
