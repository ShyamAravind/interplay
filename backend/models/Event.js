const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Event title is required'],
            trim: true,
        },
        sport: {
            type: String,
            required: [true, 'Sport type is required'],
            trim: true,
            lowercase: true,
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
        },
        date: {
            type: Date,
            required: [true, 'Event date is required'],
        },
        location: {
            type: String,
            required: [true, 'Location is required'],
            trim: true,
        },
        district: {
            type: String,
            trim: true,
            default: '',
        },
        price: {
            type: Number,
            default: 0,
        },
        totalSlots: {
            type: Number,
            default: 0,
        },
        availableSlots: {
            type: Number,
            default: 0,
        },
        posterImage: {
            type: String,
            default: '',
        },
        registrationLink: {
            type: String,
            default: '',
        },
        organizerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        isTournament: {
            type: Boolean,
            default: false,
        },
        coordinates: {
            lat: { type: Number },
            lng: { type: Number },
        },
    },
    { timestamps: true }
);

// Index for search & filtering
eventSchema.index({ sport: 1, date: -1 });
eventSchema.index({ district: 1 });
eventSchema.index({ title: 'text', location: 'text', district: 'text' });

module.exports = mongoose.model('Event', eventSchema);
