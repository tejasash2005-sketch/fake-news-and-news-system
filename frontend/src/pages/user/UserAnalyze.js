import React, { useState } from 'react';
import axios from 'axios';
import { useLanguage } from '../../context/LanguageContext';

export default function UserAnalyze() {
  const { t } = useLanguage();
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reported, setReported] = useState(false);

  const analyze = async () => {
    if (!text.trim() || text.length < 10) return setError('Please enter at least 10 characters');
    setError(''); setLoading(true); setResult(null); setReported(false);
    try {
      const r = await axios.post('/api/analyze', { text });
      setResult(r.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed');
    } finally { setLoading(false); }
  };

  const submitReport = async () => {
    if (!result) return;
    try {
      await axios.post('/api/reports', {
        title: text.substring(0, 80),
        description: `Auto-reported: ${result.verdict} (${result.fake_probability}% fake probability)`,
        analysis_id: result.id
      });
      setReported(true);
    } catch {}
  };

  const exampleTexts = [
    'Scientists discover lizard people are secretly controlling world governments, leaked documents prove',
    'NASA announces new Mars mission scheduled for launch next year with crew of four astronauts',
    'SHOCKING: Government hiding secret cure for cancer to protect pharmaceutical profits EXPOSED',
    'Central bank raises interest rates by 0.25% following inflation data from last quarter',
  ];

  const credColor = (score) => {
    if (score >= 70) return 'var(--success)';
    if (score >= 40) return 'var(--suspicious)';
    return 'var(--danger)';
  };

  const getHighlightedText = (text, keywords) => {
    if (!keywords || keywords.length === 0) return text;
    let parts = [text];
    keywords.forEach(kw => {
      let newParts = [];
      parts.forEach(part => {
        if (typeof part !== 'string') { newParts.push(part); return; }
        const regex = new RegExp(`(${kw})`, 'gi');
        const split = part.split(regex);
        split.forEach((s, i) => {
          if (s.toLowerCase() === kw.toLowerCase()) newParts.push(<span key={i} className="highlight-fake">{s}</span>);
          else if (s) newParts.push(s);
        });
      });
      parts = newParts;
    });
    return parts;
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">🔍 {t('analyze_title')}</div>
        <div className="page-subtitle">{t('analyze_subtitle')}</div>
      </div>
      <div className="page-content">

        <div className="card mb-24">
          <div className="card-title">📝 {t('enter_text')}</div>
          <textarea
            className="analyze-textarea"
            value={text}
            onChange={e => setText(e.target.value)}
            /** R​e​m​e​m​b​e​r​ ​t​o​ ​u​p​d​a​t​e​ ​t​h​e​ ​e​n​v​ ​v​a​r​i​a​b​l​e​s​ ​b​e​f​o​r​e​ ​d​e​p​l​o​y​m​e​n​t​. */
            placeholder={t('placeholder')}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text3)', fontFamily: 'JetBrains Mono' }}>
              {text.length} chars · {text.split(' ').filter(Boolean).length} {t('words')}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => { setText(''); setResult(null); setError(''); }}>{t('clear')}</button>
              <button className="btn btn-primary" onClick={analyze} disabled={loading || text.length < 10}>
                {loading ? <span className="analyzing">⏳ {t('analyzing')}</span> : `⚡ ${t('analyze_now')}`}
              </button>
            </div>
          </div>
          {error && <div className="error-msg" style={{ marginTop: '12px' }}>{error}</div>}
        </div>

        {/* Example texts */}
        <div className="card mb-24">
          <div className="card-title">📋 {t('try_examples')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {exampleTexts.map((ex, i) => (
              <button key={i} className="btn btn-secondary" style={{ textAlign: 'left', justifyContent: 'flex-start', whiteSpace: 'normal', height: 'auto', padding: '10px 14px', fontSize: '0.8rem' }}
                onClick={() => { setText(ex); setResult(null); setError(''); }}>
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className={`result-card ${result.verdictClass}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text3)', fontFamily: 'JetBrains Mono', letterSpacing: '2px', marginBottom: '6px' }}>{t('verdict')}</div>
                <div className={`verdict-text ${result.verdictClass}`}>{result.verdict}</div>
                <div style={{ marginTop: '4px', fontSize: '0.75rem', color: 'var(--text3)' }}>{t('confidence')}: <span style={{ color: 'var(--text)' }}>{result.confidence}</span></div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text3)', fontFamily: 'JetBrains Mono', marginBottom: '4px' }}>{t('credibility')}</div>
                <div style={{ fontFamily: 'Orbitron', fontSize: '2.5rem', fontWeight: 900, color: credColor(result.credibility_score), lineHeight: 1 }}>
                  {result.credibility_score}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text3)' }}>out of 100</div>
              </div>
            </div>

            {/* Probability bars */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                <span style={{ color: 'var(--success)' }}>{t('real')}: {result.real_probability}%</span>
                <span style={{ color: 'var(--danger)' }}>{t('fake')}: {result.fake_probability}%</span>
              </div>
              <div className="prob-bar">
                <div className="prob-fill real" style={{ width: `${result.real_probability}%` }} />
              </div>
              <div className="prob-bar" style={{ marginTop: '4px' }}>
                <div className="prob-fill fake" style={{ width: `${result.fake_probability}%` }} />
              </div>
            </div>

            {/* Metrics */}
            <div className="metrics-grid">
              <div className="metric">
                <div className="metric-val" style={{fontSize: '0.9rem', color: 'var(--warning)'}}>{result.sentiment}</div>
                <div className="metric-lbl">Sentiment</div>
              </div>
              <div className="metric">
                <div className="metric-val">{result.word_count}</div>
                <div className="metric-lbl">{t('words')}</div>
              </div>
              <div className="metric">
                <div className="metric-val">{result.sensational_keywords?.length || 0}</div>
                <div className="metric-lbl">{t('red_flags')}</div>
              </div>
            </div>

            {/* Explainable AI: Highlighted Text */}
            <div style={{ marginTop: '20px', background: 'var(--bg2)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border)' }}>
               <div style={{ fontSize: '0.65rem', color: 'var(--text3)', fontFamily: 'JetBrains Mono', marginBottom: '8px' }}>🔍 AI EXPLAINABILITY: HIGHLIGHTED FLAGS</div>
               <div style={{ fontSize: '0.85rem', color: 'var(--text2)', lineHeight: 1.6 }}>
                 {getHighlightedText(text, result.sensational_keywords)}
               </div>
            </div>

            {/* Sensational keywords */}
            {result.sensational_keywords?.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text3)', fontFamily: 'JetBrains Mono', marginBottom: '8px' }}>⚠️ {t('red_flags').toUpperCase()} DETECTED</div>
                <div>{result.sensational_keywords.map(k => <span key={k} className="keyword-tag">{k}</span>)}</div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '20px', flexWrap: 'wrap' }}>
              {!reported ? (
                <button className="btn btn-danger btn-sm" onClick={submitReport}>🚩 {t('report_content')}</button>
              ) : (
                <span style={{ fontSize: '0.78rem', color: 'var(--success)' }}>✅ {t('report_submitted')}</span>
              )}
              <button className="btn btn-secondary btn-sm" onClick={() => { setText(''); setResult(null); }}>🔄 {t('analyze_another')}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
