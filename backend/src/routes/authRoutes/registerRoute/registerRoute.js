const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../../../models/User');
const Agent = require('../../../models/Agent');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                errors: {
                    email: !email ? 'Email is required' : undefined,
                    password: !password ? 'Password is required' : undefined
                }
            });
        }

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                errors: { email: 'Invalid email format' }
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                errors: { password: 'Password must be at least 6 characters long' }
            });
        }

        const [existingUser, existingAgent] = await Promise.all([
            User.findOne({ email }),
            Agent.findOne({ email })
        ]);

        if (existingUser || existingAgent) {
            return res.status(400).json({
                success: false,
                errors: { email: 'Email already registered' }
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword });
        await user.save();

        const token = jwt.sign(
            { userId: user._id, email: user.email, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return res.status(201).json({
            success: true,
            message: 'Admin registered successfully',
            user: { email: user.email, role: 'admin' },
            token
        });

    } catch (error) {
        console.error('Register error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

module.exports = router;
