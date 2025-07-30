require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { Pool } = require('pg');

const app = express();
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());


global.pool = new Pool({ connectionString: process.env.DATABASE_URL });


app.use('/api/auth',   require('./routes/auth'));
app.use('/api/jobs',   require('./routes/jobs'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/messages',     require('./routes/messages'));
app.use('/api/payments',     require('./routes/payments'));
app.use('/api/gdpr',         require('./routes/gdpr'));


app.get('/health', (_, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API on :${PORT}`));
