const express = require('express');
const Event = require('../models/Event');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// POST /api/events — Create event (any authenticated user)
router.post('/', protect, upload.single('posterImage'), async (req, res) => {
    try {
        const { title, sport, description, date, location, district, registrationLink, price, totalSlots, isTournament } = req.body;

        const slots = parseInt(totalSlots) || 0;

        const event = await Event.create({
            title,
            sport,
            description,
            date,
            location,
            district: district || '',
            registrationLink: registrationLink || '',
            price: parseFloat(price) || 0,
            totalSlots: slots,
            availableSlots: slots,
            posterImage: req.file ? `/uploads/${req.file.filename}` : '',
            organizerId: req.user._id,
            isTournament: isTournament === 'true' || isTournament === true,
        });

        await event.populate('organizerId', 'name email');

        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/events/districts — List all Tamil Nadu districts
router.get('/districts', async (req, res) => {
    const districts = [
        'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore',
        'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram',
        'Kanniyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai',
        'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai',
        'Ramanathapuram', 'Ranipet', 'Salem', 'Sivagangai', 'Tenkasi',
        'Thanjavur', 'Theni', 'Thoothukudi (Tuticorin)', 'Tiruchirappalli',
        'Tirunelveli', 'Tirupathur', 'Tiruppur', 'Tiruvallur',
        'Tiruvannamalai', 'Tiruvarur', 'Vellore', 'Viluppuram', 'Virudhunagar',
    ];
    res.json({ districts });
});

// GET /api/events — List events with filters
router.get('/', async (req, res) => {
    try {
        const { sport, location, district, date, search, page = 1, limit = 12 } = req.query;
        const filter = {};

        if (sport) {
            filter.sport = sport.toLowerCase();
        }

        if (location) {
            filter.location = { $regex: location, $options: 'i' };
        }

        if (district) {
            filter.district = district;
        }

        if (date) {
            const startOfDay = new Date(date);
            const endOfDay = new Date(date);
            endOfDay.setDate(endOfDay.getDate() + 1);
            filter.date = { $gte: startOfDay, $lt: endOfDay };
        }

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } },
                { sport: { $regex: search, $options: 'i' } },
                { district: { $regex: search, $options: 'i' } },
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [events, total] = await Promise.all([
            Event.find(filter)
                .populate('organizerId', 'name email')
                .sort({ date: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Event.countDocuments(filter),
        ]);

        res.json({
            events,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/events/:id — Get single event
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate(
            'organizerId',
            'name email'
        );

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json(event);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
