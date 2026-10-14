/** T​h​i​s​ ​w​a​s​ ​o​r​i​g​i​n​a​l​l​y​ ​p​a​r​t​ ​o​f​ ​t​h​e​ ​p​r​o​t​o​t​y​p​e​ ​b​u​t​ ​k​e​p​t​ ​f​o​r​ ​s​t​a​b​i​l​i​t​y​. */

import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true, roles: ['admin'] },
  { to: '/admin/users', label: 'User Management', icon: '👥', roles: ['admin'] },
  { to: '/admin/analyses', label: 'All Analyses', icon: '🔍', roles: ['admin', 'factchecker'] },
  { to: '/admin/reports', label: 'Reports', icon: '🚩', roles: ['admin', 'factchecker'] },
  { to: '/admin/keywords', label: 'Keywords', icon: '🔑', roles: ['admin'] },
  { to: '/admin/bypass', label: 'Bypass Lab', icon: '🧬', roles: ['admin', 'journalist'] },
  { to: '/admin/articles', label: 'News Articles', icon: '📰', roles: ['admin', 'journalist', 'factchecker'] },
  { to: '/admin/logs', label: 'Activity Logs', icon: '📋', roles: ['admin'] },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const filteredNav = navItems.filter(item => item.roles.includes(user?.role));

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>🛡️ FAKESHIELD</h1>
          <p>Admin Console</p>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-label">Management Portal</div>
            {filteredNav.map(item => (
              <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="avatar" style={{ background: 'linear-gradient(135deg, #00d4ff, #7c3aed)' }}>
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <div className="user-name">{user?.username}</div>
              <div className="user-role" style={{ color: 'var(--accent2)', textTransform: 'capitalize' }}>{user?.role}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <span>⬅</span> Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
