const axios = require('axios');

const client = axios.create({
  baseURL: process.env.PROXY_URL,
  headers: { Authorization: `Bearer ${process.env.PROXY_API_KEY}` },
  timeout: 8000,
});

// Returns { id, username } or null if no account exists
async function getAccount(discordId) {
  try {
    const { data } = await client.get(`/account/${discordId}`);
    return data;
  } catch (err) {
    if (err.response?.status === 404) return null;
    throw err;
  }
}

// Returns { id, username } on success
// Throws with err.response.status === 409 if username is taken
async function createAccount(discordId, username, password) {
  const { data } = await client.post('/account', { discordId, username, password });
  return data;
}

// Returns true on success
async function changePassword(discordId, password) {
  await client.patch(`/account/${discordId}/password`, { password });
  return true;
}

// Returns array of character rows (may be empty)
async function getCharacters(accountId) {
  try {
    const { data } = await client.get(`/characters/${accountId}`);
    return data;
  } catch (err) {
    if (err.response?.status === 404) return [];
    throw err;
  }
}

module.exports = { getAccount, createAccount, changePassword, getCharacters };
