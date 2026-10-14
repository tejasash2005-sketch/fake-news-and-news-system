/** T​h​i​s​ ​w​a​s​ ​o​r​i​g​i​n​a​l​l​y​ ​p​a​r​t​ ​o​f​ ​t​h​e​ ​p​r​o​t​o​t​y​p​e​ ​b​u​t​ ​k​e​p​t​ ​f​o​r​ ​s​t​a​b​i​l​i​t​y​. */

import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ status: '', admin_note: '' });

  const fetchReports = () => axios.get('/api/admin/reports').then(r => setReports(r.data)).finally(() => setLoading(false));
  useEffect(() => { fetchReports(); }, []);

  const openEdit = (r) => { setSelected(r); setForm({ status: r.status, admin_note: r.admin_note || '' }); };

  const handleUpdate = async (e) => {
    e.preventDefault();
    await axios.patch(`/api/admin/reports/${selected.id}`, form);
    setSelected(null);
    fetchReports();
  };

  const statusBadge = (s) => {
    if (s === 'pending') return <span className="badge badge-pending">Pending</span>;
    if (s === 'resolved') return <span className="badge badge-resolved">Resolved</span>;
    return <span className="badge badge-dismissed">Dismissed</span>;
  };

  const pending = reports.filter(r => r.status === 'pending').length;
  const resolved = reports.filter(r => r.status === 'resolved').length;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">🚩 Reports Management</div>
        <div className="page-subtitle">Review and respond to user-submitted fake news reports</div>
      </div>
      <div className="page-content">

        <div className="stats-grid mb-16">
          <div className="stat-card yellow"><div className="stat-label">Pending</div><div className="stat-value">{pending}</div></div>
          <div className="stat-card green"><div className="stat-label">Resolved</div><div className="stat-value">{resolved}</div></div>
          <div className="stat-card blue"><div className="stat-label">Total</div><div className="stat-value">{reports.length}</div></div>
        </div>

        <div className="card">
          {loading ? <div className="loading">Loading reports...</div> : reports.length === 0 ? (
            <div className="empty-state"><div style={{ fontSize: '3rem' }}>📭</div><p>No reports submitted</p></div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>#</th><th>Reporter</th><th>Title</th><th>URL</th><th>Status</th><th>Admin Note</th><th>Date</th><th>Actions</th></tr></thead>
                <tbody>
                  {reports.map((r, i) => (
                    <tr key={r.id}>
                      <td className="text-xs text-muted">{i + 1}</td>
                      <td><span style={{ color: 'var(--accent)', fontFamily: 'JetBrains Mono', fontSize: '0.8rem' }}>{r.username}</span></td>
                      <td style={{ maxWidth: '200px', fontSize: '0.82rem', color: 'var(--text)' }}>{r.title?.substring(0, 50)}{r.title?.length > 50 ? '...' : ''}</td>
                      <td>{r.url ? <a href={r.url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontSize: '0.75rem' }}>🔗 Link</a> : <span className="text-muted text-xs">—</span>}</td>
                      <td>{statusBadge(r.status)}</td>
                      <td style={{ maxWidth: '160px', fontSize: '0.78rem', color: 'var(--text3)' }}>{r.admin_note || '—'}</td>
                      <td className="text-xs text-muted">{new Date(r.created_at).toLocaleDateString()}</td>
                      <td><button className="btn btn-secondary btn-sm" onClick={() => openEdit(r)}>✏️ Review</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">✏️ Review Report</div>
            <div style={{ marginBottom: '16px', padding: '12px', background: 'var(--bg2)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text3)', marginBottom: '4px' }}>Report from: <span style={{ color: 'var(--accent)' }}>{selected.username}</span></div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text)', fontWeight: 500, marginBottom: '6px' }}>{selected.title}</div>
              {selected.description && <div style={{ fontSize: '0.82rem', color: 'var(--text3)' }}>{selected.description}</div>}
            </div>
            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                  <option value="pending">Pending</option>
                  <option value="resolved">Resolved</option>
                  <option value="dismissed">Dismissed</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Admin Note (visible to user)</label>
                <textarea className="form-textarea" value={form.admin_note} onChange={e => setForm({...form, admin_note: e.target.value})} placeholder="Provide feedback to the reporter..." style={{ minHeight: '80px' }} />
              </div>
              <div className="flex-end">
                <button type="button" className="btn btn-secondary" onClick={() => setSelected(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Update Report</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
