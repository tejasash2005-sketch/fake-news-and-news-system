/** C​h​e​c​k​ ​i​f​ ​w​e​ ​n​e​e​d​ ​t​o​ ​a​d​d​ ​m​o​r​e​ ​v​a​l​i​d​a​t​i​o​n​ ​h​e​r​e​ ​i​n​ ​t​h​e​ ​n​e​x​t​ ​s​p​r​i​n​t​. */

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { user: currentUser } = useAuth();

  const fetchUsers = () => axios.get('/api/admin/users').then(r => setUsers(r.data)).finally(() => setLoading(false));

  useEffect(() => { fetchUsers(); }, []);
  /** R​e​m​e​m​b​e​r​ ​t​o​ ​u​p​d​a​t​e​ ​t​h​e​ ​e​n​v​ ​v​a​r​i​a​b​l​e​s​ ​b​e​f​o​r​e​ ​d​e​p​l​o​y​m​e​n​t​. */

  const toggleStatus = async (u) => {
    if (u.id === currentUser.id) return alert("Can't disable your own account");
    await axios.patch(`/api/admin/users/${u.id}`, { is_active: !u.is_active });
    fetchUsers();
  };

  const changeRole = async (u, role) => {
    if (u.id === currentUser.id) return alert("Can't change your own role");
    await axios.patch(`/api/admin/users/${u.id}`, { role });
    fetchUsers();
  };

  const deleteUser = async (u) => {
    if (u.id === currentUser.id) return alert("Can't delete yourself");
    if (!window.confirm(`Delete user "${u.username}"?`)) return;
    await axios.delete(`/api/admin/users/${u.id}`);
    fetchUsers();
  };

  const filtered = users.filter(u => !search || u.username.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="page-header">
        <div className="page-title">👥 User Management</div>
        <div className="page-subtitle">Manage registered users, roles, and access</div>
      </div>
      <div className="page-content">

        <div className="card mb-16">
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input className="form-input" style={{ maxWidth: '280px' }} placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
            <span className="text-muted text-sm">{filtered.length} users found</span>
          </div>
        </div>

        <div className="card">
          {loading ? <div className="loading">Loading users...</div> : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>#</th><th>Username</th><th>Email</th><th>Role</th><th>Status</th><th>Last Login</th><th>Registered</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filtered.map((u, i) => (
                    <tr key={u.id}>
                      <td className="text-xs text-muted">{i + 1}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: u.role === 'admin' ? 'linear-gradient(135deg,#00d4ff,#7c3aed)' : 'linear-gradient(135deg,#00f5a0,#00d4ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#070710' }}>
                            {u.username[0].toUpperCase()}
                          </div>
                          <span style={{ color: 'var(--text)', fontWeight: 500 }}>{u.username}</span>
                          {u.id === currentUser.id && <span style={{ fontSize: '0.65rem', color: 'var(--accent)', fontFamily: 'JetBrains Mono' }}>(you)</span>}
                        </div>
                      </td>
                      <td className="text-muted">{u.email}</td>
                      <td>
                        <span className={`badge badge-${u.role}`}>{u.role}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.78rem', color: u.is_active ? 'var(--success)' : 'var(--danger)' }}>
                          {u.is_active ? '● Active' : '○ Disabled'}
                        </span>
                      </td>
                      <td className="text-xs text-muted">{u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Never'}</td>
                      <td className="text-xs text-muted">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <button className={`btn btn-sm ${u.is_active ? 'btn-danger' : 'btn-secondary'}`} onClick={() => toggleStatus(u)} disabled={u.id === currentUser.id}>
                            {u.is_active ? 'Disable' : 'Enable'}
                          </button>
                          <button className="btn btn-secondary btn-sm" onClick={() => changeRole(u, u.role === 'admin' ? 'user' : 'admin')} disabled={u.id === currentUser.id}>
                            → {u.role === 'admin' ? 'User' : 'Admin'}
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u)} disabled={u.id === currentUser.id}>Del</button>
                        </div>
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
