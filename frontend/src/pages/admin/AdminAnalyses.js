/** C​h​e​c​k​ ​i​f​ ​w​e​ ​n​e​e​d​ ​t​o​ ​a​d​d​ ​m​o​r​e​ ​v​a​l​i​d​a​t​i​o​n​ ​h​e​r​e​ ​i​n​ ​t​h​e​ ​n​e​x​t​ ​s​p​r​i​n​t​. */

import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminAnalyses() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    axios.get('/api/admin/analyses').then(r => setAnalyses(r.data)).finally(() => setLoading(false));
    /** R​e​m​e​m​b​e​r​ ​t​o​ ​u​p​d​a​t​e​ ​t​h​e​ ​e​n​v​ ​v​a​r​i​a​b​l​e​s​ ​b​e​f​o​r​e​ ​d​e​p​l​o​y​m​e​n​t​. */
  }, []);

  const getBadge = (v) => {
    if (v === 'LIKELY FAKE') return <span className="badge badge-fake">FAKE</span>;
    if (v === 'LIKELY REAL') return <span className="badge badge-real">REAL</span>;
    return <span className="badge badge-suspicious">SUSPICIOUS</span>;
  };

  const filtered = analyses.filter(a => {
    const mf = filter === 'all' || (filter === 'fake' && a.verdict === 'LIKELY FAKE') || (filter === 'real' && a.verdict === 'LIKELY REAL') || (filter === 'suspicious' && a.verdict === 'SUSPICIOUS');
    const ms = !search || a.text.toLowerCase().includes(search.toLowerCase()) || a.username.toLowerCase().includes(search.toLowerCase());
    return mf && ms;
  });

  const fakeCount = analyses.filter(a => a.verdict === 'LIKELY FAKE').length;
  const realCount = analyses.filter(a => a.verdict === 'LIKELY REAL').length;
  const suspCount = analyses.filter(a => a.verdict === 'SUSPICIOUS').length;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">🔍 All Analyses</div>
        <div className="page-subtitle">View all user-submitted text analyses across the platform</div>
      </div>
      <div className="page-content">

        <div className="stats-grid mb-16">
          <div className="stat-card blue"><div className="stat-label">Total</div><div className="stat-value">{analyses.length}</div></div>
          <div className="stat-card red"><div className="stat-label">Fake</div><div className="stat-value">{fakeCount}</div></div>
          <div className="stat-card green"><div className="stat-label">Real</div><div className="stat-value">{realCount}</div></div>
          <div className="stat-card yellow"><div className="stat-label">Suspicious</div><div className="stat-value">{suspCount}</div></div>
        </div>

        <div className="card mb-16">
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input className="form-input" style={{ maxWidth: '250px' }} placeholder="Search text or user..." value={search} onChange={e => setSearch(e.target.value)} />
            {['all', 'fake', 'real', 'suspicious'].map(f => (
              <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
            <span className="text-muted text-sm">{filtered.length} results</span>
          </div>
        </div>

        <div className="card">
          {loading ? <div className="loading">Loading analyses...</div> : filtered.length === 0 ? (
            <div className="empty-state"><div style={{ fontSize: '3rem' }}>📭</div><p>No analyses found</p></div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>#</th><th>User</th><th>Text</th><th>Verdict</th><th>Fake%</th><th>Credibility</th><th>Flags</th><th>Date</th></tr></thead>
                <tbody>
                  {filtered.map((a, i) => (
                    <tr key={a.id}>
                      <td className="text-xs text-muted">{i + 1}</td>
                      <td><span style={{ color: 'var(--accent)', fontFamily: 'JetBrains Mono', fontSize: '0.8rem' }}>{a.username}</span></td>
                      <td style={{ maxWidth: '280px', fontSize: '0.82rem', color: 'var(--text)' }}>{a.text?.substring(0, 70)}{a.text?.length > 70 ? '...' : ''}</td>
                      <td>{getBadge(a.verdict)}</td>
                      <td style={{ fontFamily: 'JetBrains Mono', fontWeight: 600, color: a.fake_probability > 60 ? 'var(--danger)' : 'var(--success)' }}>{a.fake_probability}%</td>
                      <td style={{ fontFamily: 'Orbitron', fontWeight: 700, color: a.credibility_score >= 60 ? 'var(--success)' : 'var(--danger)' }}>{a.credibility_score}</td>
                      <td>{(a.sensational_keywords?.length || 0) > 0 ? <span style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>⚠️ {a.sensational_keywords.length}</span> : <span style={{ color: 'var(--success)', fontSize: '0.78rem' }}>✅</span>}</td>
                      <td className="text-xs text-muted">{new Date(a.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
