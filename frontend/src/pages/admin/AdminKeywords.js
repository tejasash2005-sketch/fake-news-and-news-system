import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminKeywords() {
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ keyword: '', category: 'fake', weight: 1.0 });
  const [filter, setFilter] = useState('all');

  const fetchKeywords = () => axios.get('/api/admin/keywords').then(r => setKeywords(r.data)).finally(() => setLoading(false));
  useEffect(() => { fetchKeywords(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/keywords', form);
      setShowModal(false);
      setForm({ keyword: '', category: 'fake', weight: 1.0 });
      fetchKeywords();
    } catch (err) { alert(err.response?.data?.error || 'Failed to add keyword'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this keyword?')) return;
    await axios.delete(`/api/admin/keywords/${id}`);
    fetchKeywords();
  };

  const filtered = keywords.filter(k => filter === 'all' || k.category === filter);
  const catColor = { fake: 'var(--danger)', suspicious: 'var(--suspicious)', real: 'var(--success)' };

  return (
    <div>
      <div className="page-header">
        <div className="flex-between">
          <div>
            <div className="page-title">🔑 Keyword Management</div>
            <div className="page-subtitle">Manage detection keywords and their weights</div>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Keyword</button>
        </div>
      </div>
      <div className="page-content">

        <div className="stats-grid mb-16">
          <div className="stat-card red"><div className="stat-label">Fake Keywords</div><div className="stat-value">{keywords.filter(k => k.category === 'fake').length}</div></div>
          <div className="stat-card yellow"><div className="stat-label">Suspicious</div><div className="stat-value">{keywords.filter(k => k.category === 'suspicious').length}</div></div>
          <div className="stat-card green"><div className="stat-label">Real Signals</div><div className="stat-value">{keywords.filter(k => k.category === 'real').length}</div></div>
          <div className="stat-card blue"><div className="stat-label">Total</div><div className="stat-value">{keywords.length}</div></div>
        </div>

        <div className="card mb-16">
          <div style={{ display: 'flex', gap: '8px' }}>
            {['all', 'fake', 'suspicious', 'real'].map(f => (
              <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          {loading ? <div className="loading">Loading keywords...</div> : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>#</th><th>Keyword</th><th>Category</th><th>Weight</th><th>Added</th><th>Actions</th></tr></thead>
                <tbody>
                  {filtered.map((k, i) => (
                    <tr key={k.id}>
                      <td className="text-xs text-muted">{i + 1}</td>
                      <td>
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.88rem', color: catColor[k.category] || 'var(--text)', background: 'var(--bg2)', padding: '2px 10px', borderRadius: '4px', border: `1px solid ${catColor[k.category]}40` }}>
                          {k.keyword}
                        </span>
                      </td>
                      <td><span style={{ fontSize: '0.78rem', color: catColor[k.category], fontWeight: 600, textTransform: 'capitalize' }}>{k.category}</span></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: 60, height: 6, background: 'var(--bg2)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min(100, (k.weight / 3) * 100)}%`, height: '100%', background: catColor[k.category], borderRadius: 3 }} />
                          </div>
                          <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.78rem', color: 'var(--text3)' }}>{k.weight}</span>
                        </div>
                      </td>
                      <td className="text-xs text-muted">{new Date(k.created_at).toLocaleDateString()}</td>
                      <td><button className="btn btn-danger btn-sm" onClick={() => handleDelete(k.id)}>Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">🔑 Add Detection Keyword</div>
            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label className="form-label">Keyword</label>
                <input className="form-input" value={form.keyword} onChange={e => setForm({...form, keyword: e.target.value.toLowerCase()})} required placeholder="e.g. exposed, hidden, bombshell" />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                  <option value="fake">Fake (increases fake probability)</option>
                  <option value="suspicious">Suspicious (mild warning signal)</option>
                  <option value="real">Real (decreases fake probability)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Weight: {form.weight} (1.0 = normal, 3.0 = strong)</label>
                <input type="range" min="0.5" max="3.0" step="0.5" value={form.weight} onChange={e => setForm({...form, weight: parseFloat(e.target.value)})}
                  style={{ width: '100%', accentColor: 'var(--accent)' }} />
              </div>
              <div className="flex-end">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Keyword</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
