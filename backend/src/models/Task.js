const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    agent: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true },
    firstName: { type: String, required: true },
    phone: { type: String, required: true },
    notes: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Task', TaskSchema);
