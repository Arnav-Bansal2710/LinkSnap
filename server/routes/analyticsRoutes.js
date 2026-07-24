const express = require('express');
const router  = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  getUrlAnalytics,
  getDashboardStats
} = require('../controllers/analyticsController');

router.get('/dashboard',  protect, getDashboardStats);
router.get('/url/:id',    protect, getUrlAnalytics);

module.exports = router;