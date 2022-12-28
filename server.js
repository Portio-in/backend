require('dotenv').config();

const PORT = process.env.PORT || 3000;
const DEBUG = process.env.DEBUG || false;

// Express
const express = require('express');
const Middlware = require("./middleware");
const app = express();
// Config
app.disable('x-powered-by')
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

// Auth Routes
app.use('/auth', require('./routes/auth'));
app.use('/profile', Middlware.auth, require('./routes/profile'));
app.use('/link', Middlware.auth, require('./routes/link'));
app.use('/project', Middlware.auth, require('./routes/project'));
app.use('/education', Middlware.auth, require('./routes/education'));
app.use('/experience', Middlware.auth, require('./routes/experience'));
app.use('/certificate', Middlware.auth, require('./routes/certificate'));
app.use('/achievement', Middlware.auth, require('./routes/achievement'));

app.listen(PORT, () => console.log(`🚀 @ http://localhost:${PORT}`));