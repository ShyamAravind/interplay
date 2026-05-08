const express = require('express');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const { protect } = require('../middleware/auth');

const router = express.Router();

// POST /api/bookings — Join an event
router.post('/', protect, async (req, res) => {
    try {
        const { eventId } = req.body;

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check if already joined
        const existing = await Booking.findOne({
            userId: req.user._id,
            eventId,
        });
        if (existing) {
            return res.status(400).json({ message: 'Already joined this event' });
        }

        // Check available slots (0 = unlimited)
        if (event.totalSlots > 0 && event.availableSlots <= 0) {
            return res.status(400).json({ message: 'No slots available' });
        }

        // Create booking
        const booking = await Booking.create({
            userId: req.user._id,
            eventId,
        });

        // Decrement available slots if limited
        if (event.totalSlots > 0) {
            event.availableSlots = Math.max(0, event.availableSlots - 1);
            await event.save();
        }

        res.status(201).json({
            booking,
            availableSlots: event.totalSlots > 0 ? event.availableSlots : null,
            message: 'Successfully joined the event!',
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Already joined this event' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/bookings — Get user's joined events
router.get('/', protect, async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user._id })
            .populate({
                path: 'eventId',
                populate: { path: 'organizerId', select: 'name email' },
            })
            .sort({ createdAt: -1 });

        const events = bookings
            .filter((b) => b.eventId)
            .map((b) => b.eventId);

        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/bookings/check/:eventId — Check if user has joined
router.get('/check/:eventId', protect, async (req, res) => {
    try {
        const booking = await Booking.findOne({
            userId: req.user._id,
            eventId: req.params.eventId,
        });
        res.json({ joined: !!booking });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/bookings/count/:eventId — Get join count for an event
router.get('/count/:eventId', async (req, res) => {
    try {
        const count = await Booking.countDocuments({ eventId: req.params.eventId });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
