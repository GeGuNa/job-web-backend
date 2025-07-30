const router = require('express').Router();


router.get('/', async (req, res) => {
  const { category, verified } = req.query;
  let sql = 'SELECT * FROM jobs';
  const params = [];
  if (category) { params.push(category); sql += ` WHERE category=$${params.length}`; }
  if (verified) { sql += (params.length ? ' AND' : ' WHERE') + ' verified=true'; }
  sql += ' ORDER BY vip_until DESC NULLS LAST, created_at DESC';
  const { rows } = await pool.query(sql, params);
  res.json(rows);
});


router.get('/:id', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM jobs WHERE id=$1', [req.params.id]);
  res.json(rows[0] || {});
});


router.post('/', authCompany, async (req, res) => {
  const { title, description, category, remote, salary_min, salary_max } = req.body;
  const { rows } = await pool.query(
    'INSERT INTO jobs (company_id, title, description, category, remote, salary_min, salary_max) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
    [req.user.id, title, description, category, remote, salary_min, salary_max]
  );
  res.json(rows[0]);
});


router.put('/:id/vip', async (req, res) => {
  await pool.query("UPDATE jobs SET vip_until=NOW()+INTERVAL '7 days' WHERE id=$1", [req.params.id]);
  res.json({ ok: true });
});


function authCompany(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== 'company') return res.status(403).json({ error: 'Company only' });
    req.user = payload;
    next();
  } catch { return res.status(401).json({ error: 'Invalid token' }); }
}

module.exports = router;
