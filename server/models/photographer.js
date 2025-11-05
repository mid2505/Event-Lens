const mongoose = require('mongoose');

const PhotographerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    profilePictureUrl: { type: String, required: true },
    specialty: { type: String, required: true }
});

module.exports = mongoose.model('Photographer', PhotographerSchema);