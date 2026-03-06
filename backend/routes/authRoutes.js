const express = require('express');
const router = express.Router();
const { authAdmin, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', authAdmin);
router.get('/me', protect, getMe);

module.exports = router;
