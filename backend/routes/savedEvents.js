const express = require('express');
const SavedEvent = require('../models/SavedEvent');
const { protect } = require('../middleware/auth');

const router = express.Router();

// POST /api/saved — Toggle save/unsave an event
router.post('/', protect, async (req, res) => {
    try {
        const { eventId } = req.body;

        const existing = await SavedEvent.findOne({
            userId: req.user._id,
            eventId,
        });

        if (existing) {
            await SavedEvent.deleteOne({ _id: existing._id });
            return res.json({ saved: false, message: 'Event unsaved' });
        }

        await SavedEvent.create({ userId: req.user._id, eventId });
        res.status(201).json({ saved: true, message: 'Event saved' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/saved — Get user's saved events
router.get('/', protect, async (req, res) => {
    try {
        const savedEvents = await SavedEvent.find({ userId: req.user._id })
            .populate({
                path: 'eventId',
                populate: { path: 'organizerId', select: 'name email' },
            })
            .sort({ createdAt: -1 });

        const events = savedEvents
            .filter((s) => s.eventId)
            .map((s) => s.eventId);

        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/saved/check/:eventId — Check if event is saved
router.get('/check/:eventId', protect, async (req, res) => {
    try {
        const saved = await SavedEvent.findOne({
            userId: req.user._id,
            eventId: req.params.eventId,
        });
        res.json({ saved: !!saved });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
