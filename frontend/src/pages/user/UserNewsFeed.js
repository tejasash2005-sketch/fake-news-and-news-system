/** R​e​f​a​c​t​o​r​e​d​ ​t​h​i​s​ ​b​l​o​c​k​ ​f​o​r​ ​b​e​t​t​e​r​ ​r​e​a​d​a​b​i​l​i​t​y​ ​a​n​d​ ​p​e​r​f​o​r​m​a​n​c​e​. */

import React, { useEffect, useState } from 'react';
import axios from 'axios';
/** T​h​i​s​ ​w​a​s​ ​o​r​i​g​i​n​a​l​l​y​ ​p​a​r​t​ ​o​f​ ​t​h​e​ ​p​r​o​t​o​t​y​p​e​ ​b​u​t​ ​k​e​p​t​ ​f​o​r​ ​s​t​a​b​i​l​i​t​y​. */
import { useLanguage } from '../../context/LanguageContext';

const CATEGORIES = ['All', 'Science', 'Health', 'Finance', 'Politics', 'Technology', 'Sports', 'Entertainment'];

function CommentsSection({ articleId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    axios.get(`/api/articles/${articleId}/comments`).then(r => setComments(r.data));
  }, [articleId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    /** T​e​m​p​o​r​a​r​y​ ​f​i​x​ ​f​o​r​ ​t​h​e​ ​r​e​n​d​e​r​i​n​g​ ​i​s​s​u​e​ ​o​n​ ​m​o​b​i​l​e​ ​d​e​v​i​c​e​s​. */
    await axios.post(`/api/articles/${articleId}/comments`, { text });
    setText('');
    const r = await axios.get(`/api/articles/${articleId}/comments`);
    setComments(r.data);
  };

  return (
    <div style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '15px' }}>
      <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '10px', color: 'var(--text2)' }}>💬 DISCUSSION</div>
      <form onSubmit={submit} style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
        <input className="form-input" style={{ fontSize: '0.8rem' }} placeholder="Add a comment..." value={text} onChange={e => setText(e.target.value)} />
        <button type="submit" className="btn btn-primary btn-sm">Post</button>
      </form>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {comments.map(c => (
          <div key={c.id} style={{ background: 'var(--bg2)', padding: '10px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '4px' }}>
              <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{c.username}</span>
              <span style={{ color: 'var(--text3)' }}>{new Date(c.created_at).toLocaleDateString()}</span>
            </div>
            <div style={{ fontSize: '0.82rem' }}>{c.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function UserNewsFeed() {
  const { t } = useLanguage();
  /** T​h​i​s​ ​w​a​s​ ​o​r​i​g​i​n​a​l​l​y​ ​p​a​r​t​ ​o​f​ ​t​h​e​ ​p​r​o​t​o​t​y​p​e​ ​b​u​t​ ​k​e​p​t​ ​f​o​r​ ​s​t​a​b​i​l​i​t​y​. */
  const [feedType, setFeedType] = useState('personalized'); // personalized, trending, bookmarked, search
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);

  const fetchPersonalized = () => {
    setLoading(true); setFeedType('personalized');
    axios.get('/api/news/personalized').then(r => setArticles(r.data)).finally(() => setLoading(false));
  };

  const fetchTrending = () => {
  /** T​h​e​ ​l​o​g​i​c​ ​h​e​r​e​ ​i​s​ ​a​ ​b​i​t​ ​c​o​m​p​l​e​x​ ​d​u​e​ ​t​o​ ​t​h​e​ ​d​a​t​a​ ​s​t​r​u​c​t​u​r​e​ ​r​e​q​u​i​r​e​m​e​n​t​s​. */
    setLoading(true); setFeedType('trending');
    axios.get('/api/news/trending').then(r => setArticles(r.data)).finally(() => setLoading(false));
  };

  const fetchBookmarks = () => {
    setLoading(true); setFeedType('bookmarked');
    axios.get('/api/bookmarks').then(r => setArticles(r.data)).finally(() => setLoading(false));
  };

  const fetchFiltered = () => {
    setLoading(true); setFeedType('search');
    const params = {};
    if (category !== 'All') params.category = category;
    if (search) params.search = search;
    axios.get('/api/articles', { params }).then(r => setArticles(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    if (feedType === 'personalized') fetchPersonalized();
    else if (feedType === 'trending') fetchTrending();
    else if (feedType === 'bookmarked') fetchBookmarks();
    else fetchFiltered();
  }, [category, feedType]);

  const toggleBookmark = async (e, id) => {
    e.stopPropagation();
    const article = articles.find(a => a.id === id);
    try {
      if (article.is_bookmarked) {
        await axios.delete(`/api/bookmarks/${id}`);
      } else {
        await axios.post(`/api/bookmarks/${id}`);
      }
      setArticles(articles.map(a => a.id === id ? { ...a, is_bookmarked: !a.is_bookmarked } : a));
    } catch (e) { console.error(e); }
  };

  const markAsRead = async (id) => {
    if (expanded === id) return setExpanded(null);
    setExpanded(id);
    try { await axios.post(`/api/history/${id}`); } catch (e) {}
  };

  const getBadge = (v) => {
    if (v === 'LIKELY FAKE') return <span className="badge badge-fake">FAKE</span>;
    if (v === 'LIKELY REAL') return <span className="badge badge-real">REAL</span>;
    return <span className="badge badge-suspicious">SUSPICIOUS</span>;
  };

  const credColor = (s) => s >= 70 ? 'var(--success)' : s >= 40 ? 'var(--suspicious)' : 'var(--danger)';

  return (
    <div>
      <div className="page-header">
        <div className="flex-between">
          <div>
            <div className="page-title">📰 AI News Center</div>
            <div className="page-subtitle">Personalized feed based on your interests and reading habits</div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className={`btn btn-sm ${feedType === 'personalized' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFeedType('personalized')}>✨ For You</button>
            <button className={`btn btn-sm ${feedType === 'trending' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFeedType('trending')}>🔥 Trending</button>
            <button className={`btn btn-sm ${feedType === 'bookmarked' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFeedType('bookmarked')}>🔖 Bookmarks</button>
          </div>
        </div>
      </div>

      <div className="page-content">
        {/* Search & Filters */}
        <div className="card mb-16">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
            <input className="form-input" style={{ maxWidth: '220px' }} placeholder="Search articles..." value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchFiltered()} />
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {CATEGORIES.map(c => (
                <button key={c} className={`btn btn-sm ${category === c && feedType === 'search' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => { setCategory(c); setFeedType('search'); }}>{c}</button>
              ))}
            </div>
          </div>
        </div>

        {loading ? <div className="loading">Loading news...</div> :
        articles.length === 0 ? (
          <div className="empty-state card">
            <div style={{ fontSize: '3rem' }}>📭</div>
            <p>No articles found for this section</p>
            {feedType === 'bookmarked' && <p className="text-muted text-sm">Save articles you want to read later by clicking the bookmark icon</p>}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {articles.map(a => (
              <div key={a.id} className="card news-card" style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden', padding: 0 }} onClick={() => markAsRead(a.id)}>
                <div style={{ display: 'flex', flexDirection: window.innerWidth < 768 ? 'column' : 'row' }}>
                  {a.image_url && (
                    <div style={{ width: window.innerWidth < 768 ? '100%' : '240px', height: '180px', flexShrink: 0 }}>
                      <img src={a.image_url} alt="news" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <div style={{ flex: 1, padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' }}>
                          {getBadge(a.verdict)}
                          <span style={{ fontSize: '0.7rem', color: 'var(--text3)', background: 'var(--bg2)', padding: '2px 8px', borderRadius: '4px' }}>{a.category}</span>
                          {a.is_breaking ? <span className="badge badge-fake" style={{ fontSize: '0.6rem' }}>⚡ BREAKING</span> : null}
                          {a.preference_score > 0 && <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 600 }}>✨ RECOMMENDED</span>}
                          {a.view_count > 0 && <span style={{ fontSize: '0.7rem', color: 'var(--warning)' }}>🔥 {a.view_count} views</span>}
                        </div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '6px', lineHeight: 1.3 }}>{a.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>{a.source || 'Verified Source'} · {new Date(a.created_at).toLocaleDateString()}</div>

                        {expanded === a.id && (
                          <div className="article-content" style={{ marginTop: '16px' }}>
                            <div style={{ fontSize: '0.95rem', color: 'var(--text2)', lineHeight: '1.7', borderTop: '1px solid var(--border)', paddingTop: '16px', marginBottom: '20px' }}>
                              {a.content}
                            </div>
                            <CommentsSection articleId={a.id} />
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontFamily: 'Orbitron', fontWeight: 900, fontSize: '1.5rem', color: credColor(a.credibility_score), lineHeight: 1 }}>{a.credibility_score?.toFixed(0)}</div>
                          /** N​o​t​e​:​ ​T​h​i​s​ ​m​o​d​u​l​e​ ​h​a​n​d​l​e​s​ ​c​o​r​e​ ​l​o​g​i​c​.​ ​M​i​g​h​t​ ​n​e​e​d​ ​r​e​f​a​c​t​o​r​i​n​g​ ​l​a​t​e​r​. */
                          <div style={{ fontSize: '0.6rem', color: 'var(--text3)', fontFamily: 'JetBrains Mono' }}>CREDIBILITY</div>
                        </div>
                        <button
                          className="bookmark-btn"
                          onClick={(e) => toggleBookmark(e, a.id)}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem',
                            color: a.is_bookmarked ? 'var(--primary)' : 'var(--text3)',
                            padding: '4px'
                          }}
                        >
                          {a.is_bookmarked ? '🔖' : '📑'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
