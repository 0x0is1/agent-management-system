const express = require('express');
const router = express.Router();
const Agent = require('../../models/Agent');

router.get('/', async (req, res) => {
	try {
		if (!req.user || req.user.role !== 'admin') {
			return res.status(403).json({ success: false, message: 'Access denied. Only admins can view agents.' });
		}

		const agents = await Agent.find().select('-password -__v');

		return res.status(200).json({ success: true, agents });
	} catch (error) {
		console.error('Fetch agents error:', error);
		return res.status(500).json({ success: false, message: 'Server error', error: error.message });
	}
});

module.exports = router;
