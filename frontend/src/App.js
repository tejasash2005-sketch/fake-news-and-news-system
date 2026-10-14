/** N​o​t​e​:​ ​T​h​i​s​ ​m​o​d​u​l​e​ ​h​a​n​d​l​e​s​ ​c​o​r​e​ ​l​o​g​i​c​.​ ​M​i​g​h​t​ ​n​e​e​d​ ​r​e​f​a​c​t​o​r​i​n​g​ ​l​a​t​e​r​. */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
/** T​h​e​ ​l​o​g​i​c​ ​h​e​r​e​ ​i​s​ ​a​ ​b​i​t​ ​c​o​m​p​l​e​x​ ​d​u​e​ ​t​o​ ​t​h​e​ ​d​a​t​a​ ​s​t​r​u​c​t​u​r​e​ ​r​e​q​u​i​r​e​m​e​n​t​s​. */

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// User Pages
import UserLayout from './pages/user/UserLayout';
import UserDashboard from './pages/user/UserDashboard';
import UserAnalyze from './pages/user/UserAnalyze';
import UserHistory from './pages/user/UserHistory';
import UserNewsFeed from './pages/user/UserNewsFeed';
import UserReports from './pages/user/UserReports';
import UserFeedback from './pages/user/UserFeedback';
import UserInterests from './pages/user/UserInterests';
import UserReadingHistory from './pages/user/UserReadingHistory';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAnalyses from './pages/admin/AdminAnalyses';
import AdminReports from './pages/admin/AdminReports';
import AdminKeywords from './pages/admin/AdminKeywords';
import AdminArticles from './pages/admin/AdminArticles';
import AdminLogs from './pages/admin/AdminLogs';
import AdminBypass from './pages/admin/AdminBypass';

function PrivateRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  const isStaff = user && ['admin', 'journalist', 'factchecker'].includes(user.role);

  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#0a0a0f',color:'#00f5a0',fontFamily:'monospace',fontSize:'1.2rem'}}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  if (adminOnly && !isStaff) return <Navigate to="/user" replace />;
  if (!adminOnly && isStaff) return <Navigate to="/admin" replace />;

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* User Routes */}
          <Route path="/user" element={<PrivateRoute><UserLayout /></PrivateRoute>}>
            <Route index element={<UserDashboard />} />
            <Route path="analyze" element={<UserAnalyze />} />
            <Route path="history" element={<UserHistory />} />
            <Route path="news" element={<UserNewsFeed />} />
            <Route path="interests" element={<UserInterests />} />
            <Route path="reading-history" element={<UserReadingHistory />} />
            <Route path="reports" element={<UserReports />} />
            <Route path="feedback" element={<UserFeedback />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<PrivateRoute adminOnly><AdminLayout /></PrivateRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="analyses" element={<AdminAnalyses />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="keywords" element={<AdminKeywords />} />
            <Route path="articles" element={<AdminArticles />} />
            <Route path="logs" element={<AdminLogs />} />
            <Route path="bypass" element={<AdminBypass />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
