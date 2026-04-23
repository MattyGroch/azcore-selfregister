const express = require('express');
const rateLimit = require('express-rate-limit');
const api = require('../api');

const router = express.Router();

const actionLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

function requireAuth(req, res, next) {
  if (!req.session.discord) return res.redirect('/');
  next();
}

function validateUsername(username) {
  return /^[a-zA-Z0-9]{3,16}$/.test(username);
}

function validatePassword(password) {
  return typeof password === 'string' && password.length >= 8 && password.length <= 72;
}

function csrfCheck(req, res, next) {
  if (req.body._csrf !== req.session.csrfToken) {
    return res.status(403).render('error', { message: 'Invalid form submission. Please go back and try again.' });
  }
  next();
}

function renderDashboard(res, { discord, gameAccount, characters, downloadUrl, downloadPassword, error, success, csrfToken }) {
  res.render('dashboard', { discord, gameAccount, characters: characters || [], downloadUrl, downloadPassword: downloadPassword || null, error, success, csrfToken });
}

// POST /account/register
router.post('/register', requireAuth, actionLimit, csrfCheck, async (req, res) => {
  if (req.session.gameAccount) return res.redirect('/dashboard');

  const { username, password, password_confirm } = req.body;
  const ctx = {
    discord: req.session.discord,
    gameAccount: null,
    downloadUrl: process.env.CLIENT_DOWNLOAD_URL || null,
    downloadPassword: process.env.CLIENT_DOWNLOAD_PASSWORD || null,
    csrfToken: req.session.csrfToken,
    success: null,
    error: null,
  };

  if (!validateUsername(username)) {
    return renderDashboard(res, { ...ctx, error: 'Username must be 3–16 alphanumeric characters.' });
  }
  if (!validatePassword(password)) {
    return renderDashboard(res, { ...ctx, error: 'Password must be 8–72 characters.' });
  }
  if (password !== password_confirm) {
    return renderDashboard(res, { ...ctx, error: 'Passwords do not match.' });
  }

  try {
    const account = await api.createAccount(req.session.discord.id, username, password);
    req.session.gameAccount = account;
    renderDashboard(res, {
      ...ctx,
      gameAccount: account,
      success: `Account "${account.username}" created! You can now log in to the game.`,
    });
  } catch (err) {
    if (err.response?.status === 409) {
      return renderDashboard(res, { ...ctx, error: 'That username is already taken.' });
    }
    console.error('Register error:', err.message);
    renderDashboard(res, { ...ctx, error: 'An error occurred. Please try again.' });
  }
});

// POST /account/password
router.post('/password', requireAuth, actionLimit, csrfCheck, async (req, res) => {
  if (!req.session.gameAccount) return res.redirect('/dashboard');

  const { password, password_confirm } = req.body;
  const ctx = {
    discord: req.session.discord,
    gameAccount: req.session.gameAccount,
    downloadUrl: process.env.CLIENT_DOWNLOAD_URL || null,
    downloadPassword: process.env.CLIENT_DOWNLOAD_PASSWORD || null,
    csrfToken: req.session.csrfToken,
    success: null,
    error: null,
  };

  if (!validatePassword(password)) {
    return renderDashboard(res, { ...ctx, error: 'Password must be 8–72 characters.' });
  }
  if (password !== password_confirm) {
    return renderDashboard(res, { ...ctx, error: 'Passwords do not match.' });
  }

  try {
    await api.changePassword(req.session.discord.id, password);
    renderDashboard(res, { ...ctx, success: 'Password updated successfully.' });
  } catch (err) {
    console.error('Password change error:', err.message);
    renderDashboard(res, { ...ctx, error: 'An error occurred. Please try again.' });
  }
});

module.exports = router;
