const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const apiRoutes = require('./routes/api');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// API Routes
app.use('/api', apiRoutes);

// Fallback for HTML files (handling direct access to .html)
app.get('/:page', (req, res, next) => {
    const page = req.params.page;
    if (page.endsWith('.html')) {
        next();
    } else {
        const filePath = path.join(__dirname, '../public', `${page}.html`);
        res.sendFile(filePath, (err) => {
            if (err) next();
        });
    }
});

module.exports = app;
