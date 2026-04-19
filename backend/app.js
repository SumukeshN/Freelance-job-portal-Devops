const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Initialize database file if it doesn't exist
const initDB = () => {
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify([]));
    }
};
initDB();

// API to get all jobs
app.get('/jobs', (req, res) => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        res.status(500).json({ error: 'Failed to read data' });
    }
});

// API to add a new job
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

// API to delete a job
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
