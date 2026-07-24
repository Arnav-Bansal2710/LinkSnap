const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
require('dotenv').config();

const db             = require('./config/db');
const authRoutes     = require('./routes/authRoutes');
const urlRoutes      = require('./routes/urlRoutes');
const { redirectLimiter } = require('./middleware/rateLimiter');
const analyticsRoutes = require('./routes/analyticsRoutes');
const { handleRedirect, verifyPassword } = require('./controllers/redirectController');


const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

db.query('SELECT 1')
.then(() => console.log('✅ MySQL connected'))
.catch(err => console.error('❌ MySQL error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/urls', urlRoutes);

app.use('/api/analytics', analyticsRoutes);

app.post('/verify/:code', verifyPassword);

app.get('/:code', redirectLimiter, handleRedirect);

app.get('/', (req, res) => {
  res.json({ message: 'LinkSnap API running 🚀' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});