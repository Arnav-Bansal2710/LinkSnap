const rateLimit = require('express-rate-limit');

const shortenLimiter = rateLimit({
  windowMs: 60 * 1000,    
  max: 10,                 
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many links created. Please wait a minute.'
  }
});

const redirectLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: {
    error: 'Too many requests.'
  }
});

module.exports = { shortenLimiter, redirectLimiter };