import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  useEffect(() => {
    axios.get('/api/admin/logs').then(r => setLogs(r.data)).finally(() => setLoading(false));
  }, []);

  const actionTypes = ['all', ...Array.from(new Set(logs.map(l => l.action)))];

  const filtered = logs.filter(l => {
    const ms = !search || l.username?.toLowerCase().includes(search.toLowerCase()) || l.details?.toLowerCase().includes(search.toLowerCase());
    const ma = actionFilter === 'all' || l.action === actionFilter;
    return ms && ma;
  });

  const actionColor = (action) => {
    if (action === 'LOGIN') return 'var(--accent)';
    if (action === 'REGISTER') return 'var(--accent2)';
    if (action === 'ANALYZE') return 'var(--success)';
    if (action === 'REPORT') return 'var(--warning)';
    if (action?.startsWith('ADMIN')) return 'var(--suspicious)';
    if (action === 'ADD_KEYWORD') return '#a78bfa';
    return 'var(--text3)';
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">📋 Activity Logs</div>
        <div className="page-subtitle">Full audit trail of all user and admin actions</div>
      </div>
      <div className="page-content">

        <div className="stats-grid mb-16">
          <div className="stat-card blue"><div className="stat-label">Total Events</div><div className="stat-value">{logs.length}</div></div>
          <div className="stat-card green"><div className="stat-label">Logins</div><div className="stat-value">{logs.filter(l => l.action === 'LOGIN').length}</div></div>
          <div className="stat-card green"><div className="stat-label">Analyses</div><div className="stat-value">{logs.filter(l => l.action === 'ANALYZE').length}</div></div>
          <div className="stat-card yellow"><div className="stat-label">Reports</div><div className="stat-value">{logs.filter(l => l.action === 'REPORT').length}</div></div>
        </div>

        <div className="card mb-16">
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input className="form-input" style={{ maxWidth: '240px' }} placeholder="Search user or details..." value={search} onChange={e => setSearch(e.target.value)} />
            <select className="form-select" style={{ maxWidth: '200px' }} value={actionFilter} onChange={e => setActionFilter(e.target.value)}>
              {actionTypes.map(a => <option key={a} value={a}>{a === 'all' ? 'All Actions' : a}</option>)}
            </select>
            <span className="text-muted text-sm">{filtered.length} events</span>
          </div>
        </div>

        <div className="card">
          {loading ? <div className="loading">Loading logs...</div> : filtered.length === 0 ? (
            <div className="empty-state"><div style={{ fontSize: '3rem' }}>📭</div><p>No logs found</p></div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>#</th><th>User</th><th>Action</th><th>Details</th><th>Timestamp</th></tr>
                </thead>
                <tbody>
                  {filtered.map((log, i) => (
                    <tr key={log.id}>
                      <td className="text-xs text-muted">{i + 1}</td>
                      <td>
                        <span style={{ color: 'var(--accent)', fontFamily: 'JetBrains Mono', fontSize: '0.8rem' }}>
                          {log.username || 'system'}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          fontFamily: 'JetBrains Mono', fontSize: '0.72rem', fontWeight: 600,
                          color: actionColor(log.action),
                          background: actionColor(log.action) + '18',
                          padding: '2px 8px', borderRadius: '4px',
                          border: `1px solid ${actionColor(log.action)}30`
                        }}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ maxWidth: '320px', fontSize: '0.82rem', color: 'var(--text3)' }}>
                        {log.details?.substring(0, 80)}{log.details?.length > 80 ? '...' : ''}
                      </td>
                      <td className="text-xs text-muted" style={{ whiteSpace: 'nowrap' }}>
                        {new Date(log.created_at).toLocaleString()}
                      </td>
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
