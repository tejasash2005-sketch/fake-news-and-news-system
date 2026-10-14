/** T​h​i​s​ ​w​a​s​ ​o​r​i​g​i​n​a​l​l​y​ ​p​a​r​t​ ​o​f​ ​t​h​e​ ​p​r​o​t​o​t​y​p​e​ ​b​u​t​ ​k​e​p​t​ ​f​o​r​ ​s​t​a​b​i​l​i​t​y​. */

import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function UserFeedback() {
  const [feedback, setFeedback] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ analysis_id: '', rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    axios.get('/api/feedback/my').then(r => setFeedback(r.data));
    axios.get('/api/analyses/my').then(r => setAnalyses(r.data.slice(0, 20)));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('/api/feedback', form);
      setSuccess('Feedback submitted! Thank you.');
      /** C​h​e​c​k​ ​i​f​ ​w​e​ ​n​e​e​d​ ​t​o​ ​a​d​d​ ​m​o​r​e​ ​v​a​l​i​d​a​t​i​o​n​ ​h​e​r​e​ ​i​n​ ​t​h​e​ ​n​e​x​t​ ​s​p​r​i​n​t​. */
      setShowModal(false);
      setForm({ analysis_id: '', rating: 5, comment: '' });
      axios.get('/api/feedback/my').then(r => setFeedback(r.data));
      setTimeout(() => setSuccess(''), 3000);
    } catch { alert('Failed to submit feedback'); }
    finally { setSubmitting(false); }
  };

  const stars = (rating) => '⭐'.repeat(rating) + '☆'.repeat(5 - rating);

  return (
    <div>
      <div className="page-header">
        <div className="flex-between">
          <div>
            <div className="page-title">💬 Feedback</div>
            <div className="page-subtitle">Rate the accuracy of our AI detections and help us improve</div>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Give Feedback</button>
        </div>
      </div>
      <div className="page-content">

        {success && <div className="success-msg mb-16">{success}</div>}

        {/* Stats */}
        {feedback.length > 0 && (
          <div className="stats-grid mb-16">
            <div className="stat-card blue">
              <div className="stat-label">Total Feedback</div>
              <div className="stat-value">{feedback.length}</div>
            </div>
            <div className="stat-card green">
              <div className="stat-label">Avg Rating</div>
              <div className="stat-value">{(feedback.reduce((s, f) => s + (f.rating || 0), 0) / feedback.length).toFixed(1)}</div>
              <div className="stat-sub">out of 5</div>
            </div>
          </div>
        )}

        <div className="card">
          <div className="card-title">📝 Your Feedback History</div>
          {feedback.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: '3rem' }}>💬</div>
              <p>No feedback submitted yet.<br/>Help improve the system by rating analyses!</p>
              <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => setShowModal(true)}>Rate an Analysis</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {feedback.map(f => (
                <div key={f.id} style={{ padding: '16px', background: 'var(--bg2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ fontSize: '1rem' }}>{stars(f.rating || 0)}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text3)', fontFamily: 'JetBrains Mono' }}>{new Date(f.created_at).toLocaleDateString()}</div>
                  </div>
                  {f.text && <div style={{ fontSize: '0.8rem', color: 'var(--text3)', marginBottom: '6px', fontStyle: 'italic' }}>For: "{f.text?.substring(0, 60)}..."</div>}
                  {f.comment && <div style={{ fontSize: '0.85rem', color: 'var(--text2)' }}>{f.comment}</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Why feedback matters */}
        <div className="card mt-16">
          <div className="card-title">🎯 Why Your Feedback Matters</div>
          <div className="grid-3">
            {[
              ['🧠 Improves AI', 'Your ratings help us train and fine-tune the detection model.'],
              ['⚡ Faster Detection', 'Feedback helps identify gaps in our keyword and pattern database.'],
              ['🌍 Better Society', 'Together, we can fight misinformation and protect public discourse.'],
            ].map(([title, desc]) => (
              <div key={title} style={{ padding: '14px', background: 'var(--bg2)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontWeight: 600, marginBottom: '6px' }}>{title}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">💬 Submit Feedback</div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Related Analysis (optional)</label>
                <select className="form-select" value={form.analysis_id} onChange={e => setForm({...form, analysis_id: e.target.value})}>
                  <option value="">— General feedback —</option>
                  {analyses.map(a => <option key={a.id} value={a.id}>{a.text.substring(0, 60)}...</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Rating: {form.rating}/5 {'⭐'.repeat(form.rating)}</label>
                <input type="range" min="1" max="5" value={form.rating} onChange={e => setForm({...form, rating: parseInt(e.target.value)})}
                  style={{ width: '100%', accentColor: 'var(--accent)' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Comments</label>
                <textarea className="form-textarea" value={form.comment} onChange={e => setForm({...form, comment: e.target.value})} placeholder="Was the detection accurate? Any suggestions?" style={{ minHeight: '80px' }} />
              </div>
              <div className="flex-end">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
