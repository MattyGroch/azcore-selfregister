require('dotenv').config();

const REQUIRED_ENV = [
  'SESSION_SECRET',
  'DISCORD_CLIENT_ID',
  'DISCORD_CLIENT_SECRET',
  'DISCORD_REDIRECT_URI',
  'DISCORD_GUILD_ID',
  'PROXY_URL',
  'PROXY_API_KEY',
];

const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length) {
  console.error('Missing required environment variables:', missing.join(', '));
  process.exit(1);
}

const express = require('express');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const crypto = require('crypto');
const path = require('path');

const authRoutes = require('./routes/auth');
const accountRoutes = require('./routes/account');
const api = require('./api');
const { resolveRace, resolveClass, resolveZone } = require('./gameData');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));
app.set('trust proxy', 1); // Traefik sits in front

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use(session({
  store: new FileStore({ path: '/app/sessions', ttl: 86400, retries: 0 }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax',
  },
}));

// Generate CSRF token once per session
app.use((req, res, next) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(24).toString('hex');
  }
  next();
});

app.use('/auth', authRoutes);
app.use('/account', accountRoutes);

const ERROR_MESSAGES = {
  discord_denied: 'Discord sign-in was cancelled.',
  invalid_state: 'Invalid OAuth state. Please try again.',
  not_in_guild: "You must be a member of the Discord server to register.",
  auth_failed: 'Authentication failed. Please try again.',
};

app.get('/', (req, res) => {
  if (req.session.discord) return res.redirect('/dashboard');
  const errorKey = req.query.error;
  res.render('index', {
    error: ERROR_MESSAGES[errorKey] || null,
    downloadUrl: process.env.CLIENT_DOWNLOAD_URL || null,
  });
});

app.get('/dashboard', async (req, res) => {
  if (!req.session.discord) return res.redirect('/');

  let characters = [];
  if (req.session.gameAccount) {
    try {
      const raw = await api.getCharacters(req.session.gameAccount.id);
      characters = raw.map((c) => ({
        name: c.name,
        level: c.level,
        online: !!c.online,
        race: resolveRace(c.race),
        class: resolveClass(c.class),
        zone: resolveZone(c.zone),
      }));
    } catch (err) {
      console.error('Failed to fetch characters:', err.message);
    }
  }

  res.render('dashboard', {
    discord: req.session.discord,
    gameAccount: req.session.gameAccount || null,
    characters,
    downloadUrl: process.env.CLIENT_DOWNLOAD_URL || null,
    downloadPassword: process.env.CLIENT_DOWNLOAD_PASSWORD || null,
    error: null,
    success: null,
    csrfToken: req.session.csrfToken,
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('error', { message: 'Something went wrong. Please try again.' });
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
