const express = require('express');
const router = express.Router();

const Task = require('../../models/Task');
const Agent = require('../../models/Agent');

router.get('/', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        if (req.user.role === 'agent') {            
            const tasks = await Task.find({ agent: req.user.userId }).sort({ createdAt: -1 });
            return res.status(200).json({
                success: true,
                tasks
            });
        }

        if (req.user.role === 'admin') {
            const agents = await Agent.find();
            const response = {};

            for (const agent of agents) {
                const tasks = await Task.find({ agent: agent._id }).sort({ createdAt: -1 });
                response[agent.email] = {
                    name: agent.name,
                    tasks
                };
            }

            return res.status(200).json({
                success: true,
                tasks: response
            });
        }

        return res.status(403).json({ success: false, message: 'Access denied' });

    } catch (error) {
        console.error('Get Tasks error:', error);
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

module.exports = router;