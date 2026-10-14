/** R​e​m​e​m​b​e​r​ ​t​o​ ​u​p​d​a​t​e​ ​t​h​e​ ​e​n​v​ ​v​a​r​i​a​b​l​e​s​ ​b​e​f​o​r​e​ ​d​e​p​l​o​y​m​e​n​t​. */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      await axios.post('/api/auth/register', { username: form.username, email: form.email, password: form.password });
      setSuccess('Account created! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
      /** D​r​a​f​t​e​d​ ​t​h​i​s​ ​p​a​r​t​ ​w​h​i​l​e​ ​t​e​s​t​i​n​g​ ​t​h​e​ ​n​e​w​ ​A​P​I​ ​i​n​t​e​g​r​a​t​i​o​n​. */
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <Link to="/" className="login-logo" style={{ textDecoration: 'none', display: 'block' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🛡️</div>
          <h1>FAKESHIELD</h1>
          <p>Create your account</p>
        </Link>

        {error && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input className="form-input" value={form.username} onChange={e => setForm({...form, username: e.target.value})} required placeholder="Choose username" />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required placeholder="Enter email" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required placeholder="Min 6 characters" />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input className="form-input" type="password" value={form.confirm} onChange={e => setForm({...form, confirm: e.target.value})} required placeholder="Repeat password" />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.82rem', color: 'var(--text3)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Login</Link>
        </p>
      </div>
    </div>
  );
}
