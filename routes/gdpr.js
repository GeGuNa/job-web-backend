const router = require('express').Router();
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransporter({ host:'smtp.resend.com', port:465, secure:true, auth:{ user:'resend', pass:process.env.RESEND_KEY } });


router.post('/delete-request', async (req, res) => {
  const { email } = req.body;
  const token = jwt.sign({ email, op:'delete' }, process.env.JWT_SECRET, { expiresIn:'1h' });
  const link = `${req.headers.origin}/gdpr-delete.html?token=${token}`;
  await transporter.sendMail({ to:email, subject:'Confirm deletion', html:`<a href="${link}">Click to delete</a>` });
  res.json({ ok:true });
});

router.delete('/me', async (req, res) => {
  const token = req.query.token;
  const { email } = jwt.verify(token, process.env.JWT_SECRET);
  await pool.query('DELETE FROM users WHERE email=$1', [email]);
  res.json({ ok:true });
});

module.exports = router;
