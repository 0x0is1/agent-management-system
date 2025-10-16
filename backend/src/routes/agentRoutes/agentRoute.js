const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Agent = require('../../models/Agent');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+[1-9]\d{1,14}$/;

router.post('/', async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only admins can create agents.'
            });
        }

        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Request body is missing'
            });
        }

        const { name, email, mobile, password } = req.body;

        const errors = {};
        if (!name) errors.name = 'Name is required';
        if (!email) errors.email = 'Email is required';
        if (!mobile) errors.mobile = 'Mobile number is required';
        if (!password) errors.password = 'Password is required';

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ success: false, errors });
        }

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                errors: { email: 'Invalid email format' }
            });
        }

        if (!phoneRegex.test(mobile)) {
            return res.status(400).json({
                success: false,
                errors: { mobile: 'Invalid mobile format. Use +<countrycode><number>' }
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                errors: { password: 'Password must be at least 6 characters long' }
            });
        }

        const existingAgent = await Agent.findOne({ email });
        if (existingAgent) {
            return res.status(400).json({
                success: false,
                errors: { email: 'Agent with this email already exists' }
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const agent = new Agent({
            name,
            email,
            mobile,
            password: hashedPassword
        });

        await agent.save();

        const token = jwt.sign(
            { agentId: agent._id, email: agent.email, role: 'agent' },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        return res.status(201).json({
            success: true,
            message: 'Agent added successfully',
            agent: {
                name: agent.name,
                email: agent.email,
                mobile: agent.mobile
            },
            token
        });

    } catch (error) {
        console.error('Add Agent error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

module.exports = router;
