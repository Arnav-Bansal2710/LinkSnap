const express = require('express');
const router  = express.Router();
const protect = require('../middleware/authMiddleware');
const { shortenLimiter } = require('../middleware/rateLimiter');
const {
  shortenUrl,
  getUserUrls,
  deleteUrl,
  toggleUrl
} = require('../controllers/urlController');

router.post('/',          protect, shortenLimiter, shortenUrl);
router.get('/',           protect, getUserUrls);
router.delete('/:id',     protect, deleteUrl);
router.patch('/:id/toggle', protect, toggleUrl);

module.exports = router;