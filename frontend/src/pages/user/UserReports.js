/** T​e​m​p​o​r​a​r​y​ ​f​i​x​ ​f​o​r​ ​t​h​e​ ​r​e​n​d​e​r​i​n​g​ ​i​s​s​u​e​ ​o​n​ ​m​o​b​i​l​e​ ​d​e​v​i​c​e​s​. */

import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function UserReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', url: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  const fetchReports = () => {
    axios.get('/api/reports/my').then(r => setReports(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchReports(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) return;
    setSubmitting(true);
    try {
      await axios.post('/api/reports', form);
      setSuccess('Report submitted successfully!');
      setShowModal(false);
      setForm({ title: '', description: '', url: '' });
      fetchReports();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit report');
    } finally { setSubmitting(false); }
  };

  const statusBadge = (s) => {
    if (s === 'pending') return <span className="badge badge-pending">Pending</span>;
    if (s === 'resolved') return <span className="badge badge-resolved">Resolved</span>;
    return <span className="badge badge-dismissed">Dismissed</span>;
  };

  return (
    <div>
      <div className="page-header">
        <div className="flex-between">
          <div>
            <div className="page-title">🚩 My Reports</div>
            <div className="page-subtitle">Report suspicious or misleading news content</div>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Report</button>
        </div>
      </div>
      <div className="page-content">

        {success && <div className="success-msg mb-16">{success}</div>}

        <div className="card">
          {loading ? <div className="loading">Loading reports...</div> :
          reports.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: '3rem' }}>📭</div>
              <p>No reports submitted yet.<br/>Help the community by reporting fake news!</p>
              <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => setShowModal(true)}>Submit Your First Report</button>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>#</th><th>Title</th><th>URL</th><th>Status</th><th>Admin Note</th><th>Submitted</th></tr></thead>
                <tbody>
                  {reports.map((r, i) => (
                    <tr key={r.id}>
                      <td className="text-xs text-muted">{i + 1}</td>
                      <td style={{ maxWidth: '220px', fontSize: '0.85rem', color: 'var(--text)' }}>{r.title}</td>
                      <td>{r.url ? <a href={r.url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontSize: '0.75rem' }}>🔗 Link</a> : <span className="text-muted text-xs">—</span>}</td>
                      <td>{statusBadge(r.status)}</td>
                      <td style={{ maxWidth: '180px', fontSize: '0.78rem', color: 'var(--text3)' }}>{r.admin_note || '—'}</td>
                      <td className="text-xs text-muted">{new Date(r.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Report guidelines */}
        <div className="card mt-16">
          <div className="card-title">📌 Reporting Guidelines</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              '✅ Report news that our AI flagged as fake but you want human review',
              '✅ Report misleading headlines that distort facts',
              '✅ Report content that promotes conspiracy theories or disinformation',
              '✅ Include the URL source whenever possible',
              '❌ Do not report news simply because you disagree with it',
              '❌ Repeated abuse of the report system may result in account suspension',
            ].map((tip, i) => (
              <div key={i} style={{ fontSize: '0.83rem', color: tip.startsWith('✅') ? 'var(--text2)' : 'var(--text3)', padding: '8px 12px', background: 'var(--bg2)', borderRadius: 'var(--radius-sm)' }}>
                {tip}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">🚩 Submit New Report</div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Title / Headline *</label>
                <input className="form-input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="Enter the news headline" />
              </div>
              <div className="form-group">
                <label className="form-label">Source URL</label>
                <input className="form-input" value={form.url} onChange={e => setForm({...form, url: e.target.value})} placeholder="https://..." />
              </div>
              <div className="form-group">
                <label className="form-label">Description / Why you're reporting</label>
                <textarea className="form-textarea" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Explain why this content is misleading..." />
              </div>
              <div className="flex-end">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Report'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
