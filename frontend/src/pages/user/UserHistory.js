/** D​r​a​f​t​e​d​ ​t​h​i​s​ ​p​a​r​t​ ​w​h​i​l​e​ ​t​e​s​t​i​n​g​ ​t​h​e​ ​n​e​w​ ​A​P​I​ ​i​n​t​e​g​r​a​t​i​o​n​. */

import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function UserHistory() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    axios.get('/api/analyses/my').then(r => setAnalyses(r.data)).finally(() => setLoading(false));
  }, []);

  const filtered = analyses.filter(a => {
    const matchFilter = filter === 'all' || a.verdict.toLowerCase().includes(filter.replace('fake', 'likely fake').replace('real', 'likely real'));
    const matchSearch = !search || a.text.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const getBadge = (v) => {
    if (v === 'LIKELY FAKE') return <span className="badge badge-fake">FAKE</span>;
    if (v === 'LIKELY REAL') return <span className="badge badge-real">REAL</span>;
    return <span className="badge badge-suspicious">SUSPICIOUS</span>;
  };

  const credColor = (s) => s >= 70 ? 'var(--success)' : s >= 40 ? 'var(--suspicious)' : 'var(--danger)';

  return (
    <div>
      <div className="page-header">
        <div className="page-title">📋 My Analysis History</div>
        <div className="page-subtitle">All your past fake news analyses</div>
      </div>
      <div className="page-content">

        {/* Filters */}
        <div className="card mb-16">
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input className="form-input" style={{ maxWidth: '280px' }} placeholder="Search text..." value={search} onChange={e => setSearch(e.target.value)} />
            {['all', 'fake', 'real', 'suspicious'].map(f => (
              <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
            <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--text3)' }}>{filtered.length} results</span>
          </div>
        </div>

        <div className="card">
          {loading ? <div className="loading">Loading history...</div> :
          filtered.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: '3rem' }}>📭</div>
              <p>{analyses.length === 0 ? 'No analyses yet. Go analyze some news!' : 'No results match your filter.'}</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Text</th>
                    <th>Verdict</th>
                    <th>Fake%</th>
                    <th>Credibility</th>
                    <th>Words</th>
                    <th>Flags</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a, i) => (
                    <tr key={a.id}>
                      <td className="text-xs text-muted">{i + 1}</td>
                      <td>
                        <div style={{ maxWidth: '260px', fontSize: '0.82rem', color: 'var(--text)' }} title={a.text}>
                          {a.text.length > 70 ? a.text.substring(0, 70) + '...' : a.text}
                        </div>
                      </td>
                      <td>{getBadge(a.verdict)}</td>
                      <td style={{ fontFamily: 'JetBrains Mono', color: a.fake_probability > 60 ? 'var(--danger)' : 'var(--success)', fontWeight: 600 }}>
                        {a.fake_probability}%
                      </td>
                      <td>
                        <span style={{ fontFamily: 'Orbitron', fontWeight: 700, fontSize: '0.9rem', color: credColor(a.credibility_score) }}>
                          {a.credibility_score}
                        </span>
                      </td>
                      <td className="text-xs text-muted">{a.word_count}</td>
                      <td>
                        {a.sensational_keywords?.length > 0 ? (
                          <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>⚠️ {a.sensational_keywords.length}</span>
                        ) : <span style={{ color: 'var(--success)', fontSize: '0.75rem' }}>✅ 0</span>}
                      </td>
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
