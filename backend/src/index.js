const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const os = require('os');

const loginRoute = require('./routes/authRoutes/loginRoute/loginRoute');
const registerRoute = require('./routes/authRoutes/registerRoute/registerRoute');
const agentRoute = require('./routes/agentRoutes/agentRoute');
const fetchAgentsRoute = require('./routes/agentRoutes/fetchAgents');
const addTaskRoute = require('./routes/tasksRoutes/addTaskRoute');
const getTasksRoute = require('./routes/tasksRoutes/getTasksRoute');
const authMiddleware = require('./middleware/auth');

dotenv.config({ path: 'src/env/.env', override: true });

const app = express();
const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;
const HOST = process.env.HOST;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Server is running');
});

app.use('/api/login', loginRoute);
app.use('/api/register', registerRoute);
app.use('/api/create-agent', authMiddleware, agentRoute);
app.use('/api/get-agents', authMiddleware, fetchAgentsRoute);
app.use('/api/add-tasks', authMiddleware, addTaskRoute);
app.use('/api/get-tasks', authMiddleware, getTasksRoute);

app.use('/api/protected', authMiddleware, (req, res) => {
    if (req.user) {
        return res.status(200).json({ success: true, user: req.user });
    } else {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
});

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
});

function getServerIP() {
    const interfaces = os.networkInterfaces();
    for (const iface of Object.values(interfaces)) {
        for (const config of iface) {
            if (config.family === 'IPv4' && !config.internal) {
                return config.address;
            }
        }
    }
    return 'localhost';
}

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('MongoDB connected');
        app.listen(PORT, HOST, () => {
            const ipAddress = HOST === '0.0.0.0' ? getServerIP() : HOST;
            console.log(`Server is running on http://${ipAddress}:${PORT}`);
        });
    })
    .catch(err => console.error('MongoDB connection error:', err));