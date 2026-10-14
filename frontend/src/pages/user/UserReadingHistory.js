/** N​o​t​e​:​ ​T​h​i​s​ ​m​o​d​u​l​e​ ​h​a​n​d​l​e​s​ ​c​o​r​e​ ​l​o​g​i​c​.​ ​M​i​g​h​t​ ​n​e​e​d​ ​r​e​f​a​c​t​o​r​i​n​g​ ​l​a​t​e​r​. */

import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function UserReadingHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/history').then(r => setHistory(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div className="page-title">📜 Reading History</div>
        <div className="page-subtitle">Track the articles you have read recently</div>
      </div>
      <div className="page-content">
        <div className="card">
          {loading ? <div className="loading">Loading...</div> :
          history.length === 0 ? <p className="text-muted">No history found yet. Start browsing the news feed!</p> : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Article</th>
                    <th>Category</th>
                    <th>Verdict</th>
                    <th>Read At</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 500, fontSize: '0.9rem' }}>{h.title}</td>
                      <td><span className="badge badge-secondary">{h.category}</span></td>
                      <td>{h.verdict}</td>
                      <td className="text-muted text-xs">{new Date(h.read_at).toLocaleString()}</td>
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
