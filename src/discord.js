const axios = require('axios');

const TOKEN_URL = 'https://discord.com/api/oauth2/token';
const API_BASE = 'https://discord.com/api/v10';

function buildAuthUrl(state) {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    redirect_uri: process.env.DISCORD_REDIRECT_URI,
    response_type: 'code',
    scope: 'identify guilds',
    state,
  });
  return `https://discord.com/api/oauth2/authorize?${params}`;
}

async function exchangeCode(code) {
  const resp = await axios.post(TOKEN_URL, new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    client_secret: process.env.DISCORD_CLIENT_SECRET,
    grant_type: 'authorization_code',
    code,
    redirect_uri: process.env.DISCORD_REDIRECT_URI,
  }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
  return resp.data;
}

async function getUser(accessToken) {
  const resp = await axios.get(`${API_BASE}/users/@me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return resp.data;
}

async function isInGuild(accessToken, guildId) {
  const resp = await axios.get(`${API_BASE}/users/@me/guilds`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return resp.data.some((g) => g.id === guildId);
}

module.exports = { buildAuthUrl, exchangeCode, getUser, isInGuild };
