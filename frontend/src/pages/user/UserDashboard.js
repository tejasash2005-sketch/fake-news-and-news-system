/** T​h​e​ ​l​o​g​i​c​ ​h​e​r​e​ ​i​s​ ​a​ ​b​i​t​ ​c​o​m​p​l​e​x​ ​d​u​e​ ​t​o​ ​t​h​e​ ​d​a​t​a​ ​s​t​r​u​c​t​u​r​e​ ​r​e​q​u​i​r​e​m​e​n​t​s​. */

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function UserDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/analyses/stats').then(r => setStats(r.data));
    axios.get('/api/analyses/my').then(r => setRecent(r.data.slice(0, 5)));
  }, []);

  const getBadge = (v) => {
    if (v === 'LIKELY FAKE') return <span className="badge badge-fake">Fake</span>;
    if (v === 'LIKELY REAL') return <span className="badge badge-real">Real</span>;
    return <span className="badge badge-suspicious">Suspicious</span>;
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Welcome back, {user?.username} 👋</div>
        <div className="page-subtitle">Here's your fake news detection overview</div>
      </div>
      <div className="page-content">

        <div className="stats-grid">
          <div className="stat-card blue">
            <div className="stat-label">Truth Score</div>
            <div className="stat-value" style={{color: 'var(--accent)'}}>{stats?.reputation ?? '—'}</div>
            <div className="stat-sub">user reputation</div>
          </div>
          <div className="stat-card blue">
            <div className="stat-label">Total Analyses</div>
            <div className="stat-value">{stats?.total ?? '—'}</div>
            <div className="stat-sub">all time</div>
          </div>
          <div className="stat-card red">
            <div className="stat-label">Fake Detected</div>
            <div className="stat-value">{stats?.fake ?? '—'}</div>
            <div className="stat-sub">flagged articles</div>
          </div>
          <div className="stat-card green">
            <div className="stat-label">Real Verified</div>
            <div className="stat-value">{stats?.real ?? '—'}</div>
            <div className="stat-sub">confirmed real</div>
          </div>
          <div className="stat-card yellow">
            <div className="stat-label">Avg Credibility</div>
            <div className="stat-value">{stats?.avg_credibility ?? '—'}</div>
            <div className="stat-sub">out of 100</div>
          </div>
        </div>

        <div className="grid-2" style={{ gap: '16px' }}>
          {/* Quick Actions */}
          <div className="card">
            <div className="card-title">⚡ Quick Actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button className="btn btn-primary" onClick={() => navigate('/user/analyze')} style={{ justifyContent: 'center' }}>
                🔍 Analyze a News Article
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/user/news')} style={{ justifyContent: 'center' }}>
                📰 Browse News Feed
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/user/reports')} style={{ justifyContent: 'center' }}>
                🚩 Submit a Report
              </button>
            </div>

            <div style={{ marginTop: '20px', padding: '14px', background: 'var(--bg2)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text3)', fontFamily: 'JetBrains Mono', marginBottom: '4px' }}>SUSPICIOUS DETECTED</div>
              <div style={{ fontFamily: 'Orbitron', fontSize: '1.5rem', fontWeight: 700, color: 'var(--suspicious)' }}>{stats?.suspicious ?? 0}</div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <div className="card-title">🕒 Recent Analyses</div>
            {recent.length === 0 ? (
              <div className="empty-state" style={{ padding: '20px' }}>
                <p>No analyses yet.<br/>Start by analyzing some news!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {recent.map(a => (
                  <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px', background: 'var(--bg2)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ flex: 1, marginRight: '10px' }}>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text)', marginBottom: '2px' }} className="truncate" title={a.text}>
                        {a.text.substring(0, 55)}...
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text3)', fontFamily: 'JetBrains Mono' }}>
                        {new Date(a.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    {getBadge(a.verdict)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tips */}
        <div className="card" style={{ marginTop: '16px' }}>
          <div className="card-title">💡 How to Spot Fake News</div>
          <div className="grid-3">
            {[
              ['🔍 Check Sources', 'Verify if the source is credible, established, and known for accurate reporting.'],
              ['🧠 Read Critically', 'Be skeptical of sensational headlines. If it sounds too shocking, verify first.'],
              ['📅 Check Dates', 'Old news can be recirculated as new. Always check publication dates.'],
              ['🌐 Cross-Reference', 'Search for the same news on multiple credible outlets before believing it.'],
              ['🖼️ Verify Images', 'Fake news often uses out-of-context or doctored images. Use reverse image search.'],
              ['⚠️ Watch Language', 'Emotional, divisive language and ALL CAPS are common in fake news.'],
              /** T​e​m​p​o​r​a​r​y​ ​f​i​x​ ​f​o​r​ ​t​h​e​ ​r​e​n​d​e​r​i​n​g​ ​i​s​s​u​e​ ​o​n​ ​m​o​b​i​l​e​ ​d​e​v​i​c​e​s​. */
            ].map(([title, desc]) => (
              <div key={title} style={{ padding: '14px', background: 'var(--bg2)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontWeight: 600, marginBottom: '4px', fontSize: '0.85rem' }}>{title}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text3)', lineHeight: '1.5' }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
