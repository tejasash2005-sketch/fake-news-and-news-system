import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import BreakingTicker from '../../components/BreakingTicker';

export default function UserLayout() {
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const navItems = [
    { to: '/user', label: t('dashboard'), icon: '📊', end: true },
    { to: '/user/analyze', label: t('analyze'), icon: '🔍' },
    { to: '/user/news', label: t('news'), icon: '📰' },
    { to: '/user/interests', label: 'Interests', icon: '🎯' },
    { to: '/user/reading-history', label: 'Reading History', icon: '📜' },
    { to: '/user/history', label: t('history'), icon: '📋' },
    { to: '/user/reports', label: t('reports'), icon: '🚩' },
    { to: '/user/feedback', label: t('feedback'), icon: '💬' },
  ];

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>🛡️ FAKESHIELD</h1>
          <p>Detection System</p>
        </div>

        <div style={{ padding: '0 20px 10px', display: 'flex', gap: '5px' }}>
          <button
            className={`btn btn-sm ${lang === 'en' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setLang('en')}
            style={{ padding: '2px 8px', fontSize: '10px' }}
          >EN</button>
          <button
            className={`btn btn-sm ${lang === 'hi' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setLang('hi')}
            style={{ padding: '2px 8px', fontSize: '10px' }}
          >हिं</button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-label">{t('user_portal') || 'User Portal'}</div>
            {navItems.map(item => (
              <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="avatar">{user?.username?.[0]?.toUpperCase()}</div>
            <div>
              <div className="user-name">{user?.username}</div>
              <div className="user-role">User</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <span>⬅</span> {t('logout')}
          </button>
        </div>
      </aside>

      <main className="main-content">
        <BreakingTicker />
        <Outlet />
      </main>
    </div>
  );
}
