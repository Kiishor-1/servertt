const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/total-members', authMiddleware, memberController.getTotalMembers);
router.get('/growth-rate', authMiddleware, memberController.getGrowthRate);

module.exports = router;
