document.addEventListener('DOMContentLoaded', () => {
    // API Base URL
    const API_BASE = ''; 

    // DOM Elements - conditionally depending on which page we are on
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    const addJobForm = document.getElementById('add-job-form');
    const jobsList = document.getElementById('jobs-list');
    const loginError = document.getElementById('login-error');

    // Make delete function global so inline onclick can access it
    window.deleteJob = async (id) => {
        if (!confirm('Are you sure you want to delete this job?')) return;

        try {
            const response = await fetch(`${API_BASE}/delete/${id}`, { method: 'DELETE' });
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

    const fetchJobs = async () => {
        try {
            if (!jobsList) return;
            jobsList.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">Loading jobs...</div>';
            const response = await fetch(`${API_BASE}/jobs`);
            if (!response.ok) throw new Error('Failed to fetch jobs');
            const jobs = await response.json();
            
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
        } catch (error) {
            console.error('Error fetching jobs:', error);
            jobsList.innerHTML = '<div style="grid-column: 1/-1; color: var(--danger); text-align: center;">Error loading jobs. Please check if backend is running.</div>';
        }
    };

    // --- Page Logic based on presence of elements ---
    const user = localStorage.getItem('user');

    if (loginForm) {
        // We are on the Login Page (index.html)
        if (user) {
            window.location.href = 'dashboard.html'; // Redirect to dashboard if logged in
        }

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();

            if (username && password) {
                localStorage.setItem('user', username);
                loginError.classList.add('hidden');
                window.location.href = 'dashboard.html'; // Go to new page!
            } else {
                loginError.classList.remove('hidden');
            }
        });
    }

    if (dashboardView = document.getElementById('dashboard-view')) {
        // We are on the Dashboard Page (dashboard.html)
        if (!user) {
            window.location.href = 'index.html'; // Kick back to login if not logged in
        } else {
            fetchJobs(); // Load the jobs explicitly for the dashboard
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('user');
                window.location.href = 'index.html'; // Go back to login page
            });
        }

        if (addJobForm) {
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
                    btn.textContent = 'Adding...';
                    btn.disabled = true;

                    const response = await fetch(`${API_BASE}/add`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newJob)
                    });

                    if (!response.ok) throw new Error('Failed to add job');
                    
                    addJobForm.reset();
                    fetchJobs(); // Refresh list on Dashboard
                } catch (error) {
                    alert('Failed to add job.');
                } finally {
                    const btn = addJobForm.querySelector('button[type="submit"]');
                    btn.textContent = 'Add Job';
                    btn.disabled = false;
                }
            });
        }
    }
});
