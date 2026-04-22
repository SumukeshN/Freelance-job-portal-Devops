const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');
const USERS_FILE = path.join(__dirname, 'users.json');

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Initialize database files if they don't exist
const initDB = () => {
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify([]));
    }
    if (!fs.existsSync(USERS_FILE)) {
        fs.writeFileSync(USERS_FILE, JSON.stringify([]));
    }
};
initDB();

// =====================
//   AUTH ROUTES
// =====================

// POST /register — Create a new user account
app.post('/register', (req, res) => {
    try {
        const { username, password, role } = req.body;

        if (!username || !password || !role) {
            return res.status(400).json({ error: 'Username, password, and role are required.' });
        }

        const validRoles = ['admin', 'freelancer'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ error: 'Invalid role. Must be admin or freelancer.' });
        }

        const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));

        const exists = users.find(u => u.username.toLowerCase() === username.toLowerCase());
        if (exists) {
            return res.status(409).json({ error: 'Username already taken. Please choose another.' });
        }

        const newUser = {
            id: Date.now().toString(),
            username: username.trim(),
            password: password, // NOTE: In production, hash with bcrypt
            role,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

        res.status(201).json({ message: 'Account created successfully!', username: newUser.username, role: newUser.role });
    } catch (err) {
        res.status(500).json({ error: 'Registration failed. Please try again.' });
    }
});

// POST /login — Authenticate a user
app.post('/login', (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required.' });
        }

        const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));

        const user = users.find(
            u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
        );

        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }

        res.json({ message: 'Login successful', username: user.username, role: user.role });
    } catch (err) {
        res.status(500).json({ error: 'Login failed. Please try again.' });
    }
});

// =====================
//   VIEW USERS (for demo/admin)
// =====================

// GET /users — View all registered users
app.get('/users', (req, res) => {
    try {
        const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
        // Return users without passwords for safety
        const safeUsers = users.map(({ password, ...u }) => u);
        res.json(safeUsers);
    } catch (err) {
        res.status(500).json({ error: 'Failed to read users' });
    }
});

// =====================
//   JOB ROUTES
// =====================

// GET /jobs — Get all jobs
app.get('/jobs', (req, res) => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        res.status(500).json({ error: 'Failed to read data' });
    }
});

// POST /add — Add a new job
app.post('/add', (req, res) => {
    try {
        const { title, description, budget, client } = req.body;
        if (!title || !description || !budget || !client) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const data = fs.readFileSync(DATA_FILE, 'utf8');
        const jobs = JSON.parse(data);

        const newJob = {
            id: Date.now().toString(),
            title,
            description,
            budget,
            client,
            createdAt: new Date().toISOString()
        };

        jobs.push(newJob);
        fs.writeFileSync(DATA_FILE, JSON.stringify(jobs, null, 2));

        res.status(201).json({ message: 'Job added successfully', job: newJob });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save job' });
    }
});

// DELETE /delete/:id — Delete a job
app.delete('/delete/:id', (req, res) => {
    try {
        const { id } = req.params;
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        let jobs = JSON.parse(data);

        const filteredJobs = jobs.filter(job => job.id !== id);

        if (jobs.length === filteredJobs.length) {
            return res.status(404).json({ error: 'Job not found' });
        }

        fs.writeFileSync(DATA_FILE, JSON.stringify(filteredJobs, null, 2));
        res.json({ message: 'Job deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete job' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
