const express = require('express');
const crypto = require('crypto');
const db = require('../db');

const router = express.Router();

// WoW SRP6 parameters
const N = BigInt('0x894B645E89E1535BBDAD5B8B290650530801B18EBFBF5E8FAB3C82872A3E9BB7');
const g = 7n;

function modPow(base, exp, mod) {
  let result = 1n;
  base = base % mod;
  while (exp > 0n) {
    if (exp & 1n) result = (result * base) % mod;
    exp >>= 1n;
    base = (base * base) % mod;
  }
  return result;
}

function bufferToBigIntLE(buf) {
  let result = 0n;
  for (let i = buf.length - 1; i >= 0; i--)
    result = (result << 8n) | BigInt(buf[i]);
  return result;
}

function bigIntToBufferLE(n, size) {
  const buf = Buffer.alloc(size, 0);
  for (let i = 0; i < size; i++) {
    buf[i] = Number(n & 0xffn);
    n >>= 8n;
  }
  return buf;
}

function calculateSRP6(username, password) {
  const salt = crypto.randomBytes(32);

  // h1 = SHA1(UPPER(user):UPPER(pass))
  const h1 = crypto.createHash('sha1')
    .update(`${username.toUpperCase()}:${password.toUpperCase()}`)
    .digest();

  // h2 = SHA1(salt || h1)
  const h2 = crypto.createHash('sha1')
    .update(salt)
    .update(h1)
    .digest();

  const x = bufferToBigIntLE(h2);
  const verifier = bigIntToBufferLE(modPow(g, x, N), 32);

  return { salt, verifier };
}

// GET /account/:discordId
router.get('/:discordId', async (req, res) => {
  const { discordId } = req.params;
  const [rows] = await db.query(
    'SELECT id, username FROM account WHERE email = ?',
    [`discord:${discordId}`]
  );
  if (rows.length === 0) return res.status(404).json({ error: 'not_found' });
  res.json({ id: rows[0].id, username: rows[0].username });
});

// POST /account — create account
router.post('/', async (req, res) => {
  const { discordId, username, password } = req.body;

  if (!discordId || !username || !password)
    return res.status(400).json({ error: 'missing_fields' });

  const upper = username.toUpperCase();

  const [existing] = await db.query('SELECT id FROM account WHERE username = ?', [upper]);
  if (existing.length > 0)
    return res.status(409).json({ error: 'username_taken' });

  const { salt, verifier } = calculateSRP6(upper, password);
  const expansion = parseInt(process.env.EXPANSION || '2', 10);

  const [result] = await db.query(
    `INSERT INTO account (username, salt, verifier, email, joindate, last_ip, expansion)
     VALUES (?, ?, ?, ?, NOW(), '127.0.0.1', ?)`,
    [upper, salt, verifier, `discord:${discordId}`, expansion]
  );

  res.status(201).json({ id: result.insertId, username: upper });
});

// PATCH /account/:discordId/password — change password
router.patch('/:discordId/password', async (req, res) => {
  const { discordId } = req.params;
  const { password } = req.body;

  if (!password) return res.status(400).json({ error: 'missing_fields' });

  const [rows] = await db.query(
    'SELECT id, username FROM account WHERE email = ?',
    [`discord:${discordId}`]
  );
  if (rows.length === 0) return res.status(404).json({ error: 'not_found' });

  const { id, username } = rows[0];
  const { salt, verifier } = calculateSRP6(username, password);

  await db.query(
    'UPDATE account SET salt = ?, verifier = ?, session_key = NULL WHERE id = ?',
    [salt, verifier, id]
  );

  res.json({ ok: true });
});

module.exports = router;
