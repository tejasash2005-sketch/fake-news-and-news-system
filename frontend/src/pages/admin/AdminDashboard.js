/** R​e​f​a​c​t​o​r​e​d​ ​t​h​i​s​ ​b​l​o​c​k​ ​f​o​r​ ​b​e​t​t​e​r​ ​r​e​a​d​a​b​i​l​i​t​y​ ​a​n​d​ ​p​e​r​f​o​r​m​a​n​c​e​. */

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      // If not admin, they don't have access to stats, redirect to articles
      /** R​e​m​e​m​b​e​r​ ​t​o​ ​u​p​d​a​t​e​ ​t​h​e​ ​e​n​v​ ​v​a​r​i​a​b​l​e​s​ ​b​e​f​o​r​e​ ​d​e​p​l​o​y​m​e​n​t​. */
      navigate('/admin/articles');
      return;
    }

    axios.get('/api/admin/stats')
      .then(r => setStats(r.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  if (loading) return <div className="loading" style={{ paddingTop: '80px' }}>Loading dashboard...</div>;
  if (error || !stats) return (
    <div className="empty-state" style={{ paddingTop: '80px' }}>
      <div style={{ fontSize: '3rem' }}>🔒</div>
      <h3>Access Denied or Error</h3>
      <p>You do not have permission to view system analytics.</p>
    </div>
  );

  const pieData = [
    { name: 'Fake', value: stats.fakeDetected || 0, color: '#ff4757' },
    { name: 'Real', value: stats.realDetected || 0, color: '#2ed573' },
    { name: 'Suspicious', value: (stats.totalAnalyses || 0) - (stats.fakeDetected || 0) - (stats.realDetected || 0), color: '#ffd32a' },
  ].filter(d => d.value > 0);

  return (
    <div>
      <div className="page-header">
        <div className="page-title">📊 Admin Dashboard</div>
        <div className="page-subtitle">System overview and analytics</div>
      </div>
      <div className="page-content">

        <div className="stats-grid">
          <div className="stat-card blue">
            <div className="stat-label">Total Users</div>
            <div className="stat-value">{stats.totalUsers}</div>
            <div className="stat-sub">registered accounts</div>
          </div>
          <div className="stat-card green">
            <div className="stat-label">Total Analyses</div>
            <div className="stat-value">{stats.totalAnalyses}</div>
            <div className="stat-sub">texts analyzed</div>
          </div>
          <div className="stat-card red">
            <div className="stat-label">Fake Detected</div>
            <div className="stat-value">{stats.fakeDetected}</div>
            <div className="stat-sub">fake news flagged</div>
          </div>
          <div className="stat-card yellow">
            <div className="stat-label">Pending Reports</div>
            <div className="stat-value">{stats.pendingReports}</div>
            <div className="stat-sub">awaiting review</div>
          </div>
          <div className="stat-card blue">
            <div className="stat-label">Articles</div>
            <div className="stat-value">{stats.totalArticles}</div>
            <div className="stat-sub">in news database</div>
          </div>
          <div className="stat-card green">
            <div className="stat-label">Keywords</div>
            <div className="stat-value">{stats.totalKeywords}</div>
            <div className="stat-sub">in detection model</div>
          </div>
        </div>

        <div className="grid-2 mb-16">
          {/* Daily chart */}
          <div className="card">
            <div className="card-title">📈 Analyses — Last 7 Days</div>
            {stats.daily.length === 0 ? (
              <div className="empty-state" style={{ padding: '30px' }}>No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats.daily}>
                  <XAxis dataKey="date" tick={{ fill: '#5a5a7a', fontSize: 11 }} tickFormatter={v => v.slice(5)} />
                  <YAxis tick={{ fill: '#5a5a7a', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#12122a', border: '1px solid #2a2a4a', color: '#e8e8f0', borderRadius: '8px' }} />
                  <Bar dataKey="count" fill="#00f5a0" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Pie chart */}
          <div className="card">
            <div className="card-title">🥧 Detection Breakdown</div>
            {pieData.length === 0 ? (
              <div className="empty-state" style={{ padding: '30px' }}>No data yet</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={35}>
                      {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#12122a', border: '1px solid #2a2a4a', color: '#e8e8f0', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  {pieData.map(d => (
                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color }} />
                      <span style={{ color: 'var(--text3)' }}>{d.name}: {d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="grid-2">
          {/* Top users */}
          <div className="card">
            <div className="card-title">🏆 Top Analysts</div>
            {stats.topUsers.length === 0 ? <div className="empty-state" style={{ padding: '20px' }}>No data</div> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {stats.topUsers.map((u, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg2)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontFamily: 'Orbitron', fontWeight: 700, color: 'var(--accent)', fontSize: '0.8rem' }}>#{i + 1}</span>
                      <span>{u.username}</span>
                    </div>
                    <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--text3)', fontSize: '0.82rem' }}>{u.count} analyses</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent activity */}
          <div className="card">
            <div className="card-title">⚡ Recent Activity</div>
            {stats.recentActivity.length === 0 ? <div className="empty-state" style={{ padding: '20px' }}>No activity</div> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '220px', overflowY: 'auto' }}>
                {stats.recentActivity.map(log => (
                  <div key={log.id} style={{ fontSize: '0.78rem', padding: '6px 10px', background: 'var(--bg2)', borderRadius: 'var(--radius-sm)', display: 'flex', gap: '8px' }}>
                    <span style={{ color: 'var(--accent)', fontFamily: 'JetBrains Mono', flexShrink: 0 }}>{log.username || 'system'}</span>
                    <span style={{ color: 'var(--text3)' }}>{log.action}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
