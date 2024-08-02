const express = require('express');
const router = express.Router();
const engagementController = require('../controllers/engagementController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/engagement-rate', authMiddleware, engagementController.getEngagementRate);
router.get('/active-members', authMiddleware, engagementController.getActiveMembers);

module.exports = router;
