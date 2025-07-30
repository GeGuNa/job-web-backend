const router = require('express').Router();


router.get('/', async (req, res) => {
  const { thread } = req.query;
  const { rows } = await pool.query(
    'SELECT m.*, u.full_name FROM messages m JOIN users u ON u.id = m.from_id WHERE thread_id=$1 ORDER BY sent ASC',
    [thread]
  );
  res.json(rows);
});


router.post('/', async (req, res) => {
  const { thread_id, to_email, body } = req.body;
  const { rows } = await pool.query('SELECT id FROM users WHERE email=$1', [to_email]);
  const to_id = rows[0]?.id;
  if (!to_id) return res.status(404).json({ error: 'User not found' });

  const token = req.headers.authorization?.split(' ')[1];
  const payload = jwt.verify(token, process.env.JWT_SECRET);

  await pool.query(
    'INSERT INTO messages (thread_id, from_id, body) VALUES ($1,$2,$3)',
    [thread_id, payload.id, body]
  );
  res.json({ ok: true });
});

module.exports = router;
