require('dotenv').config();

const express = require('express');
const rateLimit = require('express-rate-limit');
const db = require('./db');
const dbChars = require('./dbChars');
const accountRoutes = require('./routes/account');
const characterRoutes = require('./routes/characters');

const app = express();
const PORT = process.env.PORT || 3001;

app.set('trust proxy', 1);
app.use(express.json());

// Bearer token auth — all requests must supply the shared API key
app.use((req, res, next) => {
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token || token !== process.env.API_KEY) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  next();
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use('/account', accountRoutes);
app.use('/characters', characterRoutes);

// Catch-all error handler so stack traces never leak
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'internal_error' });
});

async function start() {
  try {
    await db.query('SELECT 1');
    await dbChars.query('SELECT 1');
    console.log('Database connections OK');
  } catch (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  }
  app.listen(PORT, () => console.log(`Proxy listening on port ${PORT}`));
}

start();
