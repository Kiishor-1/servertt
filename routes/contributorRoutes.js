const express = require('express');
const router = express.Router();
const contributorController = require('../controllers/contributorsController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/top-contributors', authMiddleware, contributorController.getTopContributors);

module.exports = router;
