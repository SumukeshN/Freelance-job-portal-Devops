document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const loginView = document.getElementById('login-view');
    const dashboardView = document.getElementById('dashboard-view');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    const addJobForm = document.getElementById('add-job-form');
    const jobsList = document.getElementById('jobs-list');
    const loginError = document.getElementById('login-error');

    // API Base URL - since frontend is served by backend, we can use relative paths
    // If running separately, this would be 'http://localhost:3000'
    const API_BASE = ''; 

    // --- Authentication Logic ---
    const checkAuth = () => {
        const user = localStorage.getItem('user');
        if (user) {
            loginView.classList.remove('active');
            dashboardView.classList.add('active');
            fetchJobs();
        } else {
            loginView.classList.add('active');
            dashboardView.classList.remove('active');
        }
    };

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        if (username && password) {
            localStorage.setItem('user', username);
            loginError.classList.add('hidden');
            loginForm.reset();
            checkAuth();
        } else {
            loginError.classList.remove('hidden');
        }
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('user');
        checkAuth();
    });

    // --- Job Management Logic ---
    const fetchJobs = async () => {
        try {
            jobsList.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">Loading jobs...</div>';
            const response = await fetch(`${API_BASE}/jobs`);
            if (!response.ok) throw new Error('Failed to fetch jobs');
            const jobs = await response.json();
            renderJobs(jobs);
        } catch (error) {
            console.error('Error fetching jobs:', error);
            jobsList.innerHTML = '<div style="grid-column: 1/-1; color: var(--danger); text-align: center;">Error loading jobs. Please check if backend is running.</div>';
        }
    };

    const renderJobs = (jobs) => {
        if (jobs.length === 0) {
            jobsList.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No jobs available yet. Be the first to post!</div>';
            return;
        }

        jobsList.innerHTML = jobs.map(job => `
            <div class="job-card" data-id="${job.id}">
                <div class="job-header">
                    <div class="job-title">${escapeHTML(job.title)}</div>
                    <div class="job-budget">${escapeHTML(job.budget)}</div>
                </div>
                <div class="job-desc">${escapeHTML(job.description)}</div>
                <div class="job-footer">
                    <div class="job-client">👤 ${escapeHTML(job.client)}</div>
                    <button class="btn danger-btn" onclick="deleteJob('${job.id}')">Delete</button>
                </div>
            </div>
        `).join('');
    };

    addJobForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const newJob = {
            title: document.getElementById('job-title').value.trim(),
            client: document.getElementById('job-client').value.trim(),
            budget: document.getElementById('job-budget').value.trim(),
            description: document.getElementById('job-desc').value.trim()
        };

        try {
            const btn = addJobForm.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            btn.textContent = 'Adding...';
            btn.disabled = true;

            const response = await fetch(`${API_BASE}/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newJob)
            });

            if (!response.ok) throw new Error('Failed to add job');
            
            addJobForm.reset();
            fetchJobs(); // Refresh list
        } catch (error) {
            console.error('Error adding job:', error);
            alert('Failed to add job.');
        } finally {
            const btn = addJobForm.querySelector('button[type="submit"]');
            btn.textContent = 'Add Job';
            btn.disabled = false;
        }
    });

    // Make delete function global so inline onclick can access it
    window.deleteJob = async (id) => {
        if (!confirm('Are you sure you want to delete this job?')) return;

        try {
            const response = await fetch(`${API_BASE}/delete/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to delete job');
            
            fetchJobs(); // Refresh list
        } catch (error) {
            console.error('Error deleting job:', error);
            alert('Failed to delete job.');
        }
    };

    // Helper to prevent XSS
    const escapeHTML = (str) => {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    };

    // Init
    checkAuth();
});
