const cron = require('node-cron');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const transporter = nodemailer.createTransporter({ host:'smtp.resend.com', port:465, secure:true, auth:{ user:'resend', pass:process.env.RESEND_KEY } });


cron.schedule('0 9 * * 1', async () => {
  const { rows:jobs } = await pool.query('SELECT * FROM jobs WHERE created_at > NOW()-INTERVAL \'7 days\'');
  const html = `<h3>This week’s new jobs</h3><ul>${jobs.map(j=>`<li>${j.title}</li>`).join('')}</ul>`;

  const { rows:users } = await pool.query("SELECT email FROM users WHERE role='candidate'");
  await Promise.all(users.map(u => transporter.sendMail({ to:u.email, subject:'Weekly digest', html })));
});
