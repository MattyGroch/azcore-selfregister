const express = require('express');
const db = require('../dbChars');

const router = express.Router();

// GET /characters/:accountId
router.get('/:accountId', async (req, res) => {
  const accountId = parseInt(req.params.accountId, 10);
  if (isNaN(accountId)) return res.status(400).json({ error: 'invalid_account_id' });

  const [rows] = await db.query(
    `SELECT name, race, \`class\`, level, zone, online
     FROM characters
     WHERE account = ?
     ORDER BY level DESC`,
    [accountId]
  );

  res.json(rows);
});

module.exports = router;
