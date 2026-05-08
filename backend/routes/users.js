const express = require('express');
const User = require('../models/User');
const Event = require('../models/Event');

const router = express.Router();

// GET /api/users/:id — Get user profile
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/users/:id/events — Get events posted by a user
router.get('/:id/events', async (req, res) => {
    try {
        const events = await Event.find({ organizerId: req.params.id })
            .populate('organizerId', 'name email')
            .sort({ date: -1 });

        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
