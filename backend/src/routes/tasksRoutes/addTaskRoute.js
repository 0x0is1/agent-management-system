const express = require('express');
const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');

const Agent = require('../../models/Agent');
const Task = require('../../models/Task');

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowed = ['text/csv',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
        if (!allowed.includes(file.mimetype)) {
            return cb(new Error('Invalid file type. Only csv, xlsx, xls allowed.'));
        }
        cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 }
});

router.post('/', upload.single('file'), async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied. Only admins can upload tasks.' });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        if (!data || data.length === 0) {
            return res.status(400).json({ success: false, message: 'CSV file is empty or invalid' });
        }

        const requiredColumns = ['FirstName', 'Phone', 'Notes'];
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            for (const col of requiredColumns) {
                if (!row[col]) {
                    return res.status(400).json({
                        success: false,
                        message: `Row ${i + 2} missing required column: ${col}`
                    });
                }
            }
        }

        const agents = await Agent.find();
        if (agents.length < 1) {
            return res.status(400).json({ success: false, message: 'Not enough agents to distribute tasks. Minimum 5 required.' });
        }

        const distributed = {};
        agents.forEach(agent => distributed[agent._id] = []);
        data.forEach((task, idx) => {
            const agentIndex = idx % agents.length;
            distributed[agents[agentIndex]._id].push({
                firstName: task.FirstName,
                phone: task.Phone,
                notes: task.Notes
            });
        });

        const savedTasks = [];
        for (const [agentId, tasks] of Object.entries(distributed)) {
            for (const task of tasks) {
                const newTask = new Task({ agent: agentId, ...task });
                await newTask.save();
                savedTasks.push(newTask);
            }
        }

        const response = {};
        agents.forEach(agent => {
            response[agent.email] = distributed[agent._id];
        });

        return res.status(201).json({
            success: true,
            message: 'Tasks uploaded and distributed successfully',
            tasks: response
        });

    } catch (error) {
        console.error('Upload tasks error:', error);
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

module.exports = router;
