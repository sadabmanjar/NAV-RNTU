const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

// Generate JWT Base
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Auth user & get token
// @route   POST /api/admin/login
// @access  Public
const authAdmin = async (req, res) => {

  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });

    if (admin) {
        const isMatch = await admin.comparePassword(password);
        if (isMatch) {
            return res.json({
                _id: admin._id,
                email: admin.email,
                token: generateToken(admin._id),
            });
        }
    }
    
    res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) {
    console.error("Login Server Error:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get current admin profile
// @route   GET /api/admin/me
// @access  Private/Admin
const getMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select('-password');
    if (admin) {
      res.json(admin);
    } else {
      res.status(404).json({ message: 'Admin not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  authAdmin,
  getMe
};
