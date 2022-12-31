require('dotenv').config();

const PORT = process.env.PORT || 3000;
const DEBUG = process.env.DEBUG || false;

// Express
const express = require('express');
const Middlware = require("./middleware");
var cors = require('cors')
const app = express();
// Config
app.disable('x-powered-by')
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    optionsSuccessStatus: 200
}))

// Auth Routes
app.use('/auth', require('./routes/auth'));
app.use('/available', require('./routes/available'));
app.use('/profile', Middlware.auth, require('./routes/profile'));
app.use('/techstacks', Middlware.auth, require('./routes/techstacks'));
app.use('/link', Middlware.auth, require('./routes/link'));
app.use('/project', Middlware.auth, require('./routes/project'));
app.use('/education', Middlware.auth, require('./routes/education'));
app.use('/experience', Middlware.auth, require('./routes/experience'));
app.use('/certificate', Middlware.auth, require('./routes/certificate'));
app.use('/achievement', Middlware.auth, require('./routes/achievement'));

// 404 handler
app.get('*', (req, res) => {
    res.status(404).json({ error: "Not Found" });
})
app.post('*', (req, res) => {
    res.status(404).json({ error: "Not Found" });
})
app.patch('*', (req, res) => {
    res.status(404).json({ error: "Not Found" });
})
app.put('*', (req, res) => {
    res.status(404).json({ error: "Not Found" });
})
app.delete('*', (req, res) => {
    res.status(404).json({ error: "Not Found" });
})

// Global error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: "Unexpected Error" });
})

app.listen(PORT, () => console.log(`🚀 @ http://localhost:${PORT}`));