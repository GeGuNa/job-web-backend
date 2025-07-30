const router = require('express').Router();


router.post('/', authCandidate, async (req, res) => {
  const { jobId, video_url } = req.body;
  try {
    await pool.query(
      'INSERT INTO applications (job_id, candidate_id, video_url) VALUES ($1,$2,$3)',
      [jobId, req.user.id, video_url]
    );
    res.json({ ok: true });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Already applied' });
    throw err;
  }
});


router.patch('/:id/stage', authCompany, async (req, res) => {
  await pool.query('UPDATE applications SET stage=$1 WHERE id=$2', [req.body.stage, req.params.id]);
  res.json({ ok: true });
});


router.get('/', async (req, res) => {
  const { jobId } = req.query;
  const { rows } = await pool.query(
    'SELECT a.*, u.full_name FROM applications a JOIN users u ON u.id = a.candidate_id WHERE a.job_id=$1',
    [jobId]
  );
  res.json(rows);
});

function authCandidate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== 'candidate') return res.status(403).json({ error: 'Candidate only' });
    req.user = payload;
    next();
  } catch { return res.status(401).json({ error: 'Invalid token' }); }
}

module.exports = router;
