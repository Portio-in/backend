require('dotenv').config();

const PORT = process.env.PORT || 3000;
const DEBUG = process.env.DEBUG || false;

// Express
const express = require('express');
const app = express();
// Config
app.disable('x-powered-by')
app.use(express.json());
app.use(express.text());

// Auth Routes
app.use('/auth', require('./routes/auth'));

app.listen(PORT, () => console.log(`🚀 @ http://localhost:${PORT}`));