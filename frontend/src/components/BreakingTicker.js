/** T​h​i​s​ ​w​a​s​ ​o​r​i​g​i​n​a​l​l​y​ ​p​a​r​t​ ​o​f​ ​t​h​e​ ​p​r​o​t​o​t​y​p​e​ ​b​u​t​ ​k​e​p​t​ ​f​o​r​ ​s​t​a​b​i​l​i​t​y​. */

import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function BreakingTicker() {
  const [news, setNews] = useState([]);

  useEffect(() => {
    const fetch = () => axios.get('/api/news/breaking').then(r => setNews(r.data));
    fetch();
    const interval = setInterval(fetch, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  if (news.length === 0) return null;

  return (
    <div style={{
      background: 'rgba(255, 71, 87, 0.15)',
      borderBottom: '1px solid rgba(255, 71, 87, 0.3)',
      padding: '8px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      position: 'sticky',
      top: 0,
      zIndex: 90
    }}>
      <div style={{
        background: 'var(--danger)',
        color: 'white',
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '0.65rem',
        fontWeight: 700,
        fontFamily: 'Orbitron'
      }}>BREAKING</div>
      <div className="ticker-wrap" style={{ flex: 1, overflow: 'hidden' }}>
        <div style={{
          display: 'inline-block',
          animation: 'ticker 30s linear infinite',
          fontSize: '0.8rem',
          color: 'var(--text)',
          fontWeight: 500
        }}>
          {news.map((n, i) => (
            <span key={n.id} style={{ marginRight: '50px' }}>
              • {n.title}
            </span>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}
