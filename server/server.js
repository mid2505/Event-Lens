const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors()); // Allows requests from your frontend
app.use(express.json()); // Allows server to accept JSON in request bodies

// Serve static files from the parent directory
app.use(express.static(path.join(__dirname, '..')));

// Import Routes
const dataRoutes = require('./routes/dataRoutes');

// Use Routes
app.use('/api', dataRoutes); // All routes in dataRoutes will be prefixed with /api

// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.get('/photographers.html', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'photographers.html'));
});

app.get('/profile.html', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'profile.html'));
});

app.get('/about.html', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'about.html'));
});

app.get('/contact.html', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'contact.html'));
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.error('MongoDB Connection Error:', err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});