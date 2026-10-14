/** T​h​i​s​ ​w​a​s​ ​o​r​i​g​i​n​a​l​l​y​ ​p​a​r​t​ ​o​f​ ​t​h​e​ ​p​r​o​t​o​t​y​p​e​ ​b​u​t​ ​k​e​p​t​ ​f​o​r​ ​s​t​a​b​i​l​i​t​y​. */

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = ['Science', 'Health', 'Finance', 'Politics', 'Technology', 'Sports', 'Entertainment', 'Other'];

export default function AdminArticles() {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', source: '', category: 'Science', image_url: '', is_breaking: false });
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [nlpLoading, setNlpLoading] = useState(false);
  const [aggLoading, setAggLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const isAdmin = user && user.role === 'admin';
  const isFactChecker = user && user.role === 'factchecker';
  const canDelete = isAdmin;
  const canRunAggregator = isAdmin;

  const runAggregator = async () => {
    if (!canRunAggregator) return;
    setAggLoading(true);
    try {
      const r = await axios.post('/api/admin/aggregate');
      alert(r.data.message);
      fetchArticles();
    } catch (e) { alert('Aggregation failed'); }
    finally { setAggLoading(false); }
  };

  const suggestCategory = async () => {
    if (!form.title || !form.content) return alert('Enter title and content first');
    setNlpLoading(true);
    try {
      const r = await axios.post('/api/admin/nlp/categorize', { title: form.title, content: form.content });
      setForm({ ...form, category: r.data.category });
    } catch (e) { console.error(e); }
    finally { setNlpLoading(false); }
  };

  const fetchArticles = () => axios.get('/api/articles').then(r => setArticles(r.data)).finally(() => setLoading(false));
  useEffect(() => { fetchArticles(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('/api/admin/articles', form);
      setShowModal(false);
      setForm({ title: '', content: '', source: '', category: 'Science' });
      /** T​h​e​ ​l​o​g​i​c​ ​h​e​r​e​ ​i​s​ ​a​ ​b​i​t​ ​c​o​m​p​l​e​x​ ​d​u​e​ ​t​o​ ​t​h​e​ ​d​a​t​a​ ​s​t​r​u​c​t​u​r​e​ ​r​e​q​u​i​r​e​m​e​n​t​s​. */
      fetchArticles();
    } catch (err) { alert(err.response?.data?.error || 'Failed to add article'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this article?')) return;
    await axios.delete(`/api/admin/articles/${id}`);
    fetchArticles();
  };

  const getBadge = (v) => {
    if (v === 'LIKELY FAKE') return <span className="badge badge-fake">FAKE</span>;
    if (v === 'LIKELY REAL') return <span className="badge badge-real">REAL</span>;
    return <span className="badge badge-suspicious">SUSPICIOUS</span>;
  };

  const filtered = articles.filter(a => !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.source?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="page-header">
        <div className="flex-between">
          <div>
            <div className="page-title">📰 News Articles Database</div>
            <div className="page-subtitle">Manage the curated news article library</div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {canRunAggregator && (
              <button className="btn btn-secondary" onClick={runAggregator} disabled={aggLoading}>
                {aggLoading ? 'Aggregating...' : '🔄 Run News Aggregator'}
              </button>
            )}
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Article</button>
          </div>
        </div>
      </div>
      <div className="page-content">

        <div className="card mb-16">
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input className="form-input" style={{ maxWidth: '280px' }} placeholder="Search articles..." value={search} onChange={e => setSearch(e.target.value)} />
            <span className="text-muted text-sm">{filtered.length} articles</span>
          </div>
        </div>

        <div className="card">
          {loading ? <div className="loading">Loading articles...</div> : filtered.length === 0 ? (
            <div className="empty-state"><div style={{ fontSize: '3rem' }}>📭</div><p>No articles found</p></div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>#</th><th>Title</th><th>Source</th><th>Category</th><th>Verdict</th><th>Credibility</th><th>Verified</th><th>Date</th><th>Actions</th></tr></thead>
                <tbody>
                  {filtered.map((a, i) => (
                    <React.Fragment key={a.id}>
                      <tr
                        onClick={() => setExpanded(expanded === a.id ? null : a.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td className="text-xs text-muted">{i + 1}</td>
                        <td style={{ maxWidth: '220px', fontSize: '0.82rem', color: 'var(--text)', fontWeight: 500 }}>
                          {a.title?.substring(0, 55)}{a.title?.length > 55 ? '...' : ''}
                        </td>
                        <td className="text-xs text-muted">{a.source || '—'}</td>
                        <td><span style={{ fontSize: '0.72rem', background: 'var(--bg2)', padding: '2px 8px', borderRadius: '4px', color: 'var(--text3)' }}>{a.category}</span></td>
                        <td>{getBadge(a.verdict)}</td>
                        <td style={{ fontFamily: 'Orbitron', fontWeight: 700, color: a.credibility_score >= 60 ? 'var(--success)' : 'var(--danger)', fontSize: '0.9rem' }}>{a.credibility_score?.toFixed(0)}</td>
                        <td>{a.is_verified ? <span style={{ color: 'var(--success)', fontSize: '0.78rem' }}>✅ Yes</span> : <span style={{ color: 'var(--text3)', fontSize: '0.78rem' }}>— No</span>}</td>
                        <td className="text-xs text-muted">{new Date(a.created_at).toLocaleDateString()}</td>
                        <td>
                          {canDelete ? (
                            <button className="btn btn-danger btn-sm" onClick={(e) => { e.stopPropagation(); handleDelete(a.id); }}>Delete</button>
                          ) : (
                            <button className="btn btn-secondary btn-sm">View</button>
                          )}
                        </td>
                      </tr>
                      {expanded === a.id && (
                        <tr>
                          <td colSpan="9" style={{ background: 'var(--bg2)', padding: '20px' }}>
                            <div className="article-content" style={{ animation: 'fadeIn 0.3s ease' }}>
                              {a.image_url && <img src={a.image_url} alt="news" style={{ width: '200px', borderRadius: '8px', marginBottom: '15px', display: 'block' }} />}
                              <div style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '8px', color: 'var(--primary)' }}>{a.title}</div>
                              <div style={{ fontSize: '0.88rem', color: 'var(--text2)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{a.content}</div>
                              <div style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--text3)' }}>
                                ID: {a.id} • Breaking: {a.is_breaking ? 'Yes' : 'No'} • Prob: {a.fake_probability}%
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-title">📰 Add News Article</div>
            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="News headline" />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Source</label>
                  <input className="form-input" value={form.source} onChange={e => setForm({...form, source: e.target.value})} placeholder="e.g. BBC, CNN" />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    Category
                    <span onClick={suggestCategory} style={{ color: 'var(--primary)', cursor: 'pointer', fontSize: '0.72rem', textDecoration: 'underline' }}>
                      {nlpLoading ? 'Suggesting...' : '🪄 Suggest AI Category'}
                    </span>
                  </label>
                  <select className="form-select" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    {[...new Set([...CATEGORIES, form.category])].map(c => <option key={c} value={c}>{c}</option>)}
                    /** N​o​t​e​:​ ​T​h​i​s​ ​m​o​d​u​l​e​ ​h​a​n​d​l​e​s​ ​c​o​r​e​ ​l​o​g​i​c​.​ ​M​i​g​h​t​ ​n​e​e​d​ ​r​e​f​a​c​t​o​r​i​n​g​ ​l​a​t​e​r​. */
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Content *</label>
                <textarea className="form-textarea" value={form.content} onChange={e => setForm({...form, content: e.target.value})} required placeholder="Article content or summary..." style={{ minHeight: '100px' }} />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Image URL</label>
                  <input className="form-input" value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} placeholder="https://..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Breaking News?</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', height: '42px' }}>
                    <input type="checkbox" checked={form.is_breaking} onChange={e => setForm({...form, is_breaking: e.target.checked})} />
                    <span className="text-sm">Mark as Breaking</span>
                  </div>
                </div>
              </div>
              <div className="flex-end">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Adding...' : 'Add Article'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
