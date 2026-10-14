/** T​h​e​ ​l​o​g​i​c​ ​h​e​r​e​ ​i​s​ ​a​ ​b​i​t​ ​c​o​m​p​l​e​x​ ​d​u​e​ ​t​o​ ​t​h​e​ ​d​a​t​a​ ​s​t​r​u​c​t​u​r​e​ ​r​e​q​u​i​r​e​m​e​n​t​s​. */

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLanguage } from '../../context/LanguageContext';

const CATEGORIES = ['Science', 'Health', 'Finance', 'Politics', 'Technology', 'Sports', 'Entertainment', 'International', 'Environment'];

export default function UserInterests() {
  const { t } = useLanguage();
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get('/api/interests').then(r => {
    /** R​e​f​a​c​t​o​r​e​d​ ​t​h​i​s​ ​b​l​o​c​k​ ​f​o​r​ ​b​e​t​t​e​r​ ​r​e​a​d​a​b​i​l​i​t​y​ ​a​n​d​ ​p​e​r​f​o​r​m​a​n​c​e​. */
      setSelected(r.data);
      setLoading(false);
    });
  }, []);

  const toggle = (cat) => {
    if (selected.includes(cat)) {
      setSelected(selected.filter(c => c !== cat));
    } else {
      setSelected([...selected, cat]);
    }
    setMessage('');
  };

  const save = async () => {
    setSaving(true);
    try {
      await axios.post('/api/interests', { categories: selected });
      setMessage('✅ Interests saved! Your news feed will now be personalized.');
      setTimeout(() => setMessage(''), 3000);
    } catch (e) {
      alert('Failed to save interests');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">🎯 Personalize Your Feed</div>
        <div className="page-subtitle">Select the topics you are interested in to get AI-powered news recommendations</div>
      </div>

      <div className="page-content" style={{ maxWidth: '800px' }}>
        <div className="card">
          <div className="card-title">Choose Categories</div>
          <p className="text-muted mb-24 text-sm">Our recommendation system uses your interests and reading habits to build a custom news feed just for you.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px', marginBottom: '32px' }}>
            {CATEGORIES.map(cat => (
              <div
                key={cat}
                onClick={() => toggle(cat)}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: `1px solid ${selected.includes(cat) ? 'var(--primary)' : 'var(--border)'}`,
                  background: selected.includes(cat) ? 'rgba(0, 245, 160, 0.05)' : 'var(--bg2)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.2s ease',
                  boxShadow: selected.includes(cat) ? '0 0 15px rgba(0, 245, 160, 0.1)' : 'none'
                }}
              >
                <div style={{
                  width: '18px', height: '18px', borderRadius: '4px', border: '1px solid var(--primary)',
                  background: selected.includes(cat) ? 'var(--primary)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'black'
                }}>
                  {selected.includes(cat) && '✓'}
                </div>
                <span style={{ color: selected.includes(cat) ? 'var(--primary)' : 'var(--text)', fontWeight: 500 }}>{cat}</span>
              </div>
            ))}
          </div>

          <div className="flex-between">
            {message ? <div className="success-msg" style={{ margin: 0 }}>{message}</div> : <div></div>}
            <button className="btn btn-primary" onClick={save} disabled={saving}>
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>

        <div className="card mt-24" style={{ background: 'linear-gradient(135deg, rgba(0, 245, 160, 0.05), rgba(0, 217, 255, 0.05))' }}>
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🧠</span> How AI Recommendations Work
            /** T​e​m​p​o​r​a​r​y​ ​f​i​x​ ​f​o​r​ ​t​h​e​ ​r​e​n​d​e​r​i​n​g​ ​i​s​s​u​e​ ​o​n​ ​m​o​b​i​l​e​ ​d​e​v​i​c​e​s​. */
          </div>
          <div className="text-sm" style={{ lineHeight: 1.6, color: 'var(--text2)' }}>
            <p><strong>1. Content-Based Filtering:</strong> We analyze the text content using NLP and match it with your chosen interests.</p>
            <p><strong>2. Implicit Feedback:</strong> Every time you read an article, our algorithm learns more about what you like, refining your feed automatically.</p>
            <p><strong>3. Trending Factors:</strong> We boost articles that are currently being read by other users across the platform.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
