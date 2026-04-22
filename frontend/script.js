document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = '';

    // =====================
    //   HELPER FUNCTIONS
    // =====================

    const escapeHTML = (str) => {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    };

    const showMessage = (id, message, type = 'error') => {
        const el = document.getElementById(id);
        if (!el) return;
        el.textContent = message;
        el.className = type === 'error' ? 'error-msg' : 'success-msg';
    };

    const hideMessage = (id) => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    };

    const setLoading = (btnId, loading) => {
        const btn = document.getElementById(btnId);
        if (!btn) return;
        const text = btn.querySelector('.btn-text');
        const spinner = btn.querySelector('.btn-spinner');
        btn.disabled = loading;
        if (text) text.textContent = loading ? 'Please wait...' : btn.dataset.label || text.textContent;
        if (spinner) spinner.classList.toggle('hidden', !loading);
    };

    // =====================
    //   REGISTER LOGIC
    // =====================

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        // Store original label
        const btn = document.getElementById('register-btn');
        if (btn) btn.dataset.label = 'Create Account';

        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideMessage('register-error');
            hideMessage('register-success');

            const username = document.getElementById('reg-username').value.trim();
            const password = document.getElementById('reg-password').value;
            const confirmPassword = document.getElementById('reg-confirm-password').value;
            const role = document.getElementById('reg-role').value;

            // Client-side validation
            if (!username || !password || !role) {
                showMessage('register-error', 'All fields are required.');
                return;
            }
            if (username.length < 3) {
                showMessage('register-error', 'Username must be at least 3 characters.');
                return;
            }
            if (password.length < 4) {
                showMessage('register-error', 'Password must be at least 4 characters.');
                return;
            }
            if (password !== confirmPassword) {
                showMessage('register-error', 'Passwords do not match.');
                return;
            }

            setLoading('register-btn', true);

            try {
                const response = await fetch(`${API_BASE}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password, role })
                });

                const data = await response.json();

                if (!response.ok) {
                    showMessage('register-error', data.error || 'Registration failed.');
                    return;
                }

                showMessage('register-success', '✅ Account created! Redirecting to login...', 'success');
                registerForm.reset();

                // Auto-switch to login tab after 1.5s
                setTimeout(() => {
                    if (typeof switchTab === 'function') switchTab('login');
                    hideMessage('register-success');
                }, 1500);

            } catch (err) {
                showMessage('register-error', 'Could not connect to server. Is the backend running?');
            } finally {
                setLoading('register-btn', false);
                const btn = document.getElementById('register-btn');
                if (btn) btn.querySelector('.btn-text').textContent = 'Create Account';
            }
        });
    }

    // =====================
    //   LOGIN LOGIC
    // =====================

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        const btn = document.getElementById('login-btn');
        if (btn) btn.dataset.label = 'Login';

        // If already logged in, redirect straight to dashboard
        if (localStorage.getItem('user')) {
            window.location.href = 'dashboard.html';
            return;
        }

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideMessage('login-error');
            hideMessage('login-success');

            const username = document.getElementById('login-username').value.trim();
            const password = document.getElementById('login-password').value;

            if (!username || !password) {
                showMessage('login-error', 'Please enter your username and password.');
                return;
            }

            setLoading('login-btn', true);

            try {
                const response = await fetch(`${API_BASE}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (!response.ok) {
                    showMessage('login-error', data.error || 'Login failed.');
                    return;
                }

                // Save session to localStorage
                localStorage.setItem('user', data.username);
                localStorage.setItem('role', data.role);

                showMessage('login-success', `✅ Welcome back, ${data.username}! Redirecting...`, 'success');

                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 800);

            } catch (err) {
                showMessage('login-error', 'Could not connect to server. Is the backend running?');
            } finally {
                setLoading('login-btn', false);
                const btn = document.getElementById('login-btn');
                if (btn) btn.querySelector('.btn-text').textContent = 'Login';
            }
        });
    }

    // =====================
    //   DASHBOARD LOGIC
    // =====================

    const dashboardView = document.getElementById('dashboard-view');
    const logoutBtn = document.getElementById('logout-btn');
    const addJobForm = document.getElementById('add-job-form');
    const jobsList = document.getElementById('jobs-list');

    // Make deleteJob global for inline onclick handlers
    window.deleteJob = async (id) => {
        if (!confirm('Are you sure you want to delete this job?')) return;
        try {
            const response = await fetch(`${API_BASE}/delete/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete job');
            fetchJobs();
        } catch (error) {
            alert('Failed to delete job.');
        }
    };

    const fetchJobs = async () => {
        try {
            if (!jobsList) return;
            jobsList.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--text-muted);">Loading jobs...</div>';
            const response = await fetch(`${API_BASE}/jobs`);
            if (!response.ok) throw new Error('Failed to fetch jobs');
            const jobs = await response.json();

            const role = localStorage.getItem('role') || 'freelancer';

            if (jobs.length === 0) {
                jobsList.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--text-muted);">No jobs available yet. Be the first to post!</div>';
                return;
            }

            jobsList.innerHTML = jobs.map(job => `
                <div class="job-card">
                    <div class="job-header">
                        <div class="job-title">${escapeHTML(job.title)}</div>
                        <div class="job-budget">${escapeHTML(job.budget)}</div>
                    </div>
                    <div class="job-desc">${escapeHTML(job.description)}</div>
                    <div class="job-footer">
                        <div class="job-client">👤 ${escapeHTML(job.client)}</div>
                        ${role === 'admin' ? `<button class="btn danger-btn" onclick="deleteJob('${job.id}')">Delete</button>` : ''}
                    </div>
                </div>
            `).join('');
        } catch (error) {
            if (jobsList) jobsList.innerHTML = '<div style="grid-column:1/-1;color:var(--danger);text-align:center;">Error loading jobs. Please check if backend is running.</div>';
        }
    };

    if (dashboardView) {
        const user = localStorage.getItem('user');
        const role = localStorage.getItem('role') || 'freelancer';

        // Guard: kick back to login if not authenticated
        if (!user) {
            window.location.href = 'index.html';
            return;
        }

        // Show welcome info in header
        const welcomeEl = document.getElementById('welcome-user');
        const roleEl = document.getElementById('user-role-badge');
        if (welcomeEl) welcomeEl.textContent = `Hi, ${user} 👋`;
        if (roleEl) {
            roleEl.textContent = role.charAt(0).toUpperCase() + role.slice(1);
            roleEl.className = `role-badge role-${role}`;
        }

        // Hide "Post a Job" section from freelancers
        if (role !== 'admin') {
            const addJobSection = document.querySelector('.add-job-section');
            if (addJobSection) addJobSection.style.display = 'none';
        }

        fetchJobs();

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('user');
                localStorage.removeItem('role');
                window.location.href = 'index.html';
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
                    fetchJobs();
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
