const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// POST /api/auth/signup
router.post(
    '/signup',
    [
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Valid email is required'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters'),

    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { name, email, password } = req.body;

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already registered' });
            }

            const user = await User.create({ name, email, password, authProvider: 'local' });

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                profilePhoto: user.profilePhoto,
                authProvider: user.authProvider,
                createdAt: user.createdAt,
                token: generateToken(user._id),
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
);

// POST /api/auth/login
router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Valid email is required'),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { email, password } = req.body;

            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            if (user.authProvider === 'google') {
                return res.status(400).json({ message: 'This account uses Google Sign-In. Please sign in with Google.' });
            }

            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                profilePhoto: user.profilePhoto,
                authProvider: user.authProvider,
                createdAt: user.createdAt,
                token: generateToken(user._id),
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
);

// POST /api/auth/google - Google OAuth login/signup
router.post('/google', async (req, res) => {
    try {
        const { googleId, email, name, profilePhoto } = req.body;

        if (!googleId || !email || !name) {
            return res.status(400).json({ message: 'Missing Google auth data' });
        }

        // Check if user exists with this Google ID or email
        let user = await User.findOne({ $or: [{ googleId }, { email }] });

        if (user) {
            // Update Google info if needed
            if (!user.googleId) {
                user.googleId = googleId;
                user.authProvider = 'google';
            }
            if (profilePhoto && !user.profilePhoto) {
                user.profilePhoto = profilePhoto;
            }
            await user.save();
        } else {
            // Create new user
            user = await User.create({
                name,
                email,
                googleId,
                profilePhoto: profilePhoto || '',
                authProvider: 'google',
            });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            profilePhoto: user.profilePhoto,
            authProvider: user.authProvider,
            createdAt: user.createdAt,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: 'Google auth failed', error: error.message });
    }
});

// GET /api/auth/me
const { protect } = require('../middleware/auth');

router.get('/me', protect, async (req, res) => {
    res.json(req.user);
});

module.exports = router;
