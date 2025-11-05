const express = require('express');
const router = express.Router();
const Photographer = require('../models/photographer');
const Review = require('../models/review');

// Endpoint to get featured photographers
router.get('/featured-photographers', async (req, res) => {
    try {
        // Fetches 3 photographers from the database. You can make this more complex later.
        const photographers = await Photographer.find().limit(3);
        res.json(photographers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Endpoint to get testimonials
router.get('/testimonials', async (req, res) => {
    try {
        // Fetches 3 reviews and populates the photographer's name
        const reviews = await Review.find().limit(3).populate('photographer', 'name');
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;