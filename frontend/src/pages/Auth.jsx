import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Loader2 } from 'lucide-react';
import './Auth.css';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  
  const navigate = useNavigate();
  const API_URL = 'http://localhost:3000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    const endpoint = isLogin ? '/login' : '/register';
    const payload = isLogin 
      ? { username, password }
      : { username, password, role };

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setSuccess(data.message);
      
      // Save user to localStorage and redirect
      localStorage.setItem('user', JSON.stringify({
        username: data.username,
        role: data.role
      }));
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="glass auth-card">
        <div className="auth-header">
          <Zap className="auth-logo-icon" size={32} />
          <h1>Freelance Hub</h1>
        </div>

        <div className="auth-tabs">
          <button 
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
          >
            Login
          </button>
          <button 
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <h2 className="auth-title">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="auth-subtitle">
            {isLogin ? 'Log in to your account' : 'Join Freelance Hub today'}
          </p>

          <div className="input-group">
            <label>Username</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          {!isLogin && (
            <>
              <div className="input-group">
                <label>Confirm Password</label>
                <input 
                  type="password" 
                  className="input-field" 
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required 
                />
              </div>
              <div className="input-group">
                <label>Role</label>
                <select 
                  className="input-field"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                >
                  <option value="" disabled>Select your role</option>
                  <option value="admin">Admin (Post & Delete Jobs)</option>
                  <option value="freelancer">Freelancer (Browse Jobs)</option>
                </select>
              </div>
            </>
          )}

          {error && <div className="error-msg">{error}</div>}
          {success && <div className="success-msg">{success}</div>}

          <button type="submit" className="btn btn-primary auth-submit-btn" disabled={loading}>
            {loading ? <Loader2 className="spinner" size={20} /> : (isLogin ? 'Login' : 'Create Account')}
          </button>
        </form>
      </div>
    </div>
  );
}
