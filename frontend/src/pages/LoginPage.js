/** D​r​a​f​t​e​d​ ​t​h​i​s​ ​p​a​r​t​ ​w​h​i​l​e​ ​t​e​s​t​i​n​g​ ​t​h​e​ ​n​e​w​ ​A​P​I​ ​i​n​t​e​g​r​a​t​i​o​n​. */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await login(form.username, form.password);
      navigate(user.role === 'admin' ? '/admin' : '/user');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  const fillDemo = (role) => {
    if (role === 'admin') setForm({ username: 'admin', password: 'admin123' });
    else setForm({ username: 'testuser', password: 'user123' });
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <Link to="/" className="login-logo" style={{ textDecoration: 'none', display: 'block' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🛡️</div>
          <h1>FAKESHIELD</h1>
          <p>AI-Powered Fake News Detection</p>
        </Link>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username or Email</label>
            <input className="form-input" value={form.username} onChange={e => setForm({...form, username: e.target.value})} required placeholder="Enter username" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required placeholder="Enter password" />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }} disabled={loading}>
            {loading ? 'Authenticating...' : 'Login'}
          </button>
        </form>

        <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center', fontSize: '0.75rem' }} onClick={() => fillDemo('admin')}>
            🔑 Fill Admin
          </button>
          <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center', fontSize: '0.75rem' }} onClick={() => fillDemo('user')}>
            👤 Fill User
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.82rem', color: 'var(--text3)' }}>
          No account? <Link to="/register" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Register here</Link>
        </p>

        <div style={{ marginTop: '24px', padding: '12px', background: 'var(--bg2)', borderRadius: 'var(--radius-sm)', fontSize: '0.72rem', color: 'var(--text3)', fontFamily: 'JetBrains Mono, monospace' }}>
          <div>Admin: admin / admin123</div>
          <div>User: testuser / user123</div>
        </div>
      </div>
    </div>
  );
}
