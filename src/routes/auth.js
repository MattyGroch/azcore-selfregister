const express = require('express');
const crypto = require('crypto');
const discord = require('../discord');
const api = require('../api');

const router = express.Router();

router.get('/discord', (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  req.session.oauthState = state;
  res.redirect(discord.buildAuthUrl(state));
});

router.get('/discord/callback', async (req, res) => {
  const { code, state, error } = req.query;

  if (error) {
    return res.redirect('/?error=discord_denied');
  }

  if (!code || !state || state !== req.session.oauthState) {
    return res.redirect('/?error=invalid_state');
  }

  delete req.session.oauthState;

  try {
    const tokens = await discord.exchangeCode(code);
    const user = await discord.getUser(tokens.access_token);
    const inGuild = await discord.isInGuild(tokens.access_token, process.env.DISCORD_GUILD_ID);

    if (!inGuild) {
      return res.redirect('/?error=not_in_guild');
    }

    const gameAccount = await api.getAccount(user.id);

    req.session.discord = {
      id: user.id,
      username: user.username,
      discriminator: user.discriminator,
      avatar: user.avatar,
    };
    req.session.gameAccount = gameAccount;

    res.redirect('/dashboard');
  } catch (err) {
    console.error('OAuth callback error:', err.code, err.message, err.config?.url);
    res.redirect('/?error=auth_failed');
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

module.exports = router;
