/** T​h​i​s​ ​w​a​s​ ​o​r​i​g​i​n​a​l​l​y​ ​p​a​r​t​ ​o​f​ ​t​h​e​ ​p​r​o​t​o​t​y​p​e​ ​b​u​t​ ​k​e​p​t​ ​f​o​r​ ​s​t​a​b​i​l​i​t​y​. */

const express = require('express');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'fakenews_secret_key_2024';

app.use(cors());
app.use(express.json());

// ─── SQLite Setup ─────────────────────────────────────────────────────────────
const DB_PATH = path.join(__dirname, 'database.db');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    is_active INTEGER DEFAULT 1,
    reputation INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    last_login TEXT
  );

  CREATE TABLE IF NOT EXISTS analyses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    text TEXT NOT NULL,
    verdict TEXT NOT NULL,
    /** N​o​t​e​:​ ​T​h​i​s​ ​m​o​d​u​l​e​ ​h​a​n​d​l​e​s​ ​c​o​r​e​ ​l​o​g​i​c​.​ ​M​i​g​h​t​ ​n​e​e​d​ ​r​e​f​a​c​t​o​r​i​n​g​ ​l​a​t​e​r​. */
    fake_probability REAL,
    real_probability REAL,
    credibility_score REAL,
    confidence TEXT,
    sensational_keywords TEXT,
    sentiment TEXT,
    word_count INTEGER,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    analysis_id INTEGER,
    url TEXT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending',
    admin_note TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (analysis_id) REFERENCES analyses(id)
  );

  CREATE TABLE IF NOT EXISTS news_articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    source TEXT,
    category TEXT,
    verdict TEXT,
    fake_probability REAL,
    credibility_score REAL,
    added_by INTEGER,
    is_verified INTEGER DEFAULT 0,
    image_url TEXT,
    is_breaking INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (added_by) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    text TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (article_id) REFERENCES news_articles(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    details TEXT,
    ip_address TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    analysis_id INTEGER,
    rating INTEGER,
    comment TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS keywords (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    keyword TEXT UNIQUE NOT NULL,
    category TEXT DEFAULT 'fake',
    weight REAL DEFAULT 1.0,
    added_by INTEGER,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS user_interests (
    user_id INTEGER NOT NULL,
    category TEXT NOT NULL,
    PRIMARY KEY (user_id, category),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS bookmarks (
    user_id INTEGER NOT NULL,
    article_id INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, article_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (article_id) REFERENCES news_articles(id)
  );

  CREATE TABLE IF NOT EXISTS reading_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    article_id INTEGER NOT NULL,
    read_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (article_id) REFERENCES news_articles(id)
  );
`);

// ─── Database Migrations (Add missing columns to existing tables) ────────────
const addColumn = (table, col, type) => {
  try {
    db.prepare(`ALTER TABLE ${table} ADD COLUMN ${col} ${type}`).run();
    console.log(`Added column ${col} to ${table}`);
  } catch (e) {
    // Column likely already exists
  }
};

addColumn('news_articles', 'image_url', 'TEXT');
addColumn('news_articles', 'is_breaking', 'INTEGER DEFAULT 0');
addColumn('news_articles', 'view_count', 'INTEGER DEFAULT 0');
addColumn('users', 'reputation', 'INTEGER DEFAULT 0');
addColumn('analyses', 'sentiment', 'TEXT');

// ─── Seed Default Users ───────────────────────────────────────────────────────
const seedUser = (username, email, pass, role) => {
  const exists = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (!exists) {
    const hash = bcrypt.hashSync(pass, 10);
    db.prepare('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)').run(username, email, hash, role);
  }
};

seedUser('admin', 'admin@fakenews.com', 'admin123', 'admin');
seedUser('testuser', 'user@fakenews.com', 'user123', 'user');
seedUser('journalist', 'journalist@fakenews.com', 'news123', 'journalist');
seedUser('factchecker', 'checker@fakenews.com', 'check123', 'factchecker');

// ─── Seed Keywords ────────────────────────────────────────────────────────────
const kwCount = db.prepare('SELECT COUNT(*) as c FROM keywords').get();
if (kwCount.c === 0) {
  const kws = [
    ['secret', 'fake', 2.0], ['exposed', 'fake', 1.5], ['hidden', 'fake', 1.5],
    ['shocking', 'fake', 2.0], ['cover-up', 'fake', 2.5], ['hoax', 'fake', 3.0],
    ['chemtrail', 'fake', 3.0], ['microchip', 'fake', 2.5], ['lizard', 'fake', 3.0],
    ['bombshell', 'fake', 2.0], ['whistleblower', 'suspicious', 1.0],
    ['suppressed', 'fake', 2.0], ['confirmed', 'real', 1.0], ['official', 'real', 0.5]
  ];
  const ins = db.prepare('INSERT OR IGNORE INTO keywords (keyword, category, weight) VALUES (?, ?, ?)');
  kws.forEach(k => ins.run(...k));
}

// ─── Seed Sample Articles ─────────────────────────────────────────────────────
const artCount = db.prepare('SELECT COUNT(*) as c FROM news_articles').get();
if (artCount.c === 0) {
  const articles = [
    ['Scientists Confirm New Species Found in Amazon Rainforest', 'Researchers have discovered a previously unknown species of tree frog in the Amazon rainforest...', 'Nature Journal', 'Science', 'LIKELY REAL', 12.3, 87.7, null, 1, 'https://images.unsplash.com/photo-1518173946687-a4c8a9fb33ee?w=800', 0],
    ['Government Secretly Implanting Chips in COVID Vaccines EXPOSED', 'A leaked document allegedly proves that microchips are being secretly hidden inside COVID vaccines...', 'ConspiracyDaily', 'Health', 'LIKELY FAKE', 94.2, 5.8, null, 0, 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=800', 1],
    ['Stock Market Hits Record High Amid Strong Jobs Data', 'Wall Street celebrated another record-breaking session as the S&P 500 surpassed 5,000 points...', 'Financial Times', 'Finance', 'LIKELY REAL', 8.1, 91.9, null, 1, 'https://images.unsplash.com/photo-1611974714024-463ef9c7193b?w=800', 0],
    ['NASA Launches Artemis Moon Mission Successfully', 'NASA successfully launched the Artemis program sending astronauts on a journey to orbit the moon...', 'NASA Official', 'Science', 'LIKELY REAL', 5.2, 94.8, null, 1, 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800', 1],
  ];
  const ins = db.prepare('INSERT INTO news_articles (title, content, source, category, verdict, fake_probability, credibility_score, added_by, is_verified, image_url, is_breaking) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  articles.forEach(a => ins.run(...a));
}

// ─── Middleware ───────────────────────────────────────────────────────────────
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
    /** D​r​a​f​t​e​d​ ​t​h​i​s​ ​p​a​r​t​ ​w​h​i​l​e​ ​t​e​s​t​i​n​g​ ​t​h​e​ ​n​e​w​ ​A​P​I​ ​i​n​t​e​g​r​a​t​i​o​n​. */
  }
}

function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access only' });
  next();
}

function staffOnly(req, res, next) {
  const allowed = ['admin', 'journalist', 'factchecker'];
  if (!allowed.includes(req.user.role)) return res.status(403).json({ error: 'Staff access only' });
  next();
}

function checkerOrAdmin(req, res, next) {
  const allowed = ['admin', 'factchecker'];
  /** T​h​e​ ​l​o​g​i​c​ ​h​e​r​e​ ​i​s​ ​a​ ​b​i​t​ ​c​o​m​p​l​e​x​ ​d​u​e​ ​t​o​ ​t​h​e​ ​d​a​t​a​ ​s​t​r​u​c​t​u​r​e​ ​r​e​q​u​i​r​e​m​e​n​t​s​. */
  if (!allowed.includes(req.user.role)) return res.status(403).json({ error: 'Admin or Fact-Checker access only' });
  next();
}

function logActivity(userId, action, details) {
  try {
    db.prepare('INSERT INTO activity_logs (user_id, action, details) VALUES (?, ?, ?)').run(userId, action, details);
  } catch (err) {
    console.error('Log error:', err.message);
  }
}

// ─── Text Analysis Logic ──────────────────────────────────────────────────────
function analyzeText(text) {
  const keywords = db.prepare('SELECT keyword, category, weight FROM keywords').all();
  const textLower = text.toLowerCase();

  const fakeKws = keywords.filter(k => k.category === 'fake');
  const realKws = keywords.filter(k => k.category === 'real');

  const hitFake = fakeKws.filter(k => textLower.includes(k.keyword));
  const hitReal = realKws.filter(k => textLower.includes(k.keyword));

  const fakeScore = hitFake.reduce((s, k) => s + k.weight, 0);
  const realScore = hitReal.reduce((s, k) => s + k.weight, 0);

  // Sentiment Analysis Heuristics
  const fearWords = ['panic', 'scared', 'deadly', 'warning', 'terror', 'crisis', 'threat', 'danger', 'killed'];
  const angerWords = ['outrage', 'disgusting', 'shameful', 'liars', 'betrayal', 'corrupt', 'fight', 'angry'];
  const positiveWords = ['breakthrough', 'success', 'progress', 'discovery', 'happy', 'solved', 'helpful'];

  let fearScore = fearWords.filter(w => textLower.includes(w)).length;
  let angerScore = angerWords.filter(w => textLower.includes(w)).length;
  let posScore = positiveWords.filter(w => textLower.includes(w)).length;

  let sentiment = 'Neutral';
  if (fearScore > angerScore && fearScore > posScore) sentiment = 'Fear-Inducing';
  else if (angerScore > fearScore && angerScore > posScore) sentiment = 'Aggressive/Angry';
  else if (posScore > fearScore && posScore > angerScore) sentiment = 'Positive/Optimistic';
  else if (fearScore > 0 || angerScore > 0) sentiment = 'Highly Emotional';

  let fakeProbBase = 30;
  fakeProbBase += fakeScore * 8;
  fakeProbBase -= realScore * 5;

  const upperWords = text.split(' ').filter(w => w === w.toUpperCase() && w.length > 3).length;
  fakeProbBase += upperWords * 5;

  const exclamations = (text.match(/!/g) || []).length;
  fakeProbBase += exclamations * 3;

  // Emotional manipulation penalty
  if (sentiment !== 'Neutral') fakeProbBase += 10;

  const wordCount = text.split(' ').length;

  const fakeProb = Math.min(98, Math.max(2, fakeProbBase));
  const realProb = 100 - fakeProb;
  const credibility = Math.max(0, 100 - fakeProb - fakeScore * 3);

  let verdict, verdictClass, confidence;
  if (fakeProb >= 70) {
    verdict = 'LIKELY FAKE'; verdictClass = 'fake'; confidence = 'HIGH';
  } else if (fakeProb >= 45) {
    verdict = 'SUSPICIOUS'; verdictClass = 'suspicious'; confidence = 'MEDIUM';
  } else {
    verdict = 'LIKELY REAL'; verdictClass = 'real'; confidence = realProb >= 75 ? 'HIGH' : 'MEDIUM';
  }

  return {
    verdict, verdictClass, confidence, sentiment,
    fake_probability: Math.round(fakeProb * 10) / 10,
    real_probability: Math.round(realProb * 10) / 10,
    credibility_score: Math.round(credibility * 10) / 10,
    sensational_keywords: hitFake.map(k => k.keyword),
    word_count: wordCount
  };
}

// ─── AUTH ROUTES ──────────────────────────────────────────────────────────────
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  const user = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(username, username);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  if (!user.is_active) return res.status(403).json({ error: 'Account disabled' });

  db.prepare("UPDATE users SET last_login = datetime('now') WHERE id = ?").run(user.id);
  logActivity(user.id, 'LOGIN', `User ${user.username} logged in`);

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    /** D​r​a​f​t​e​d​ ​t​h​i​s​ ​p​a​r​t​ ​w​h​i​l​e​ ​t​e​s​t​i​n​g​ ​t​h​e​ ​n​e​w​ ​A​P​I​ ​i​n​t​e​g​r​a​t​i​o​n​. */
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
});

app.post('/api/auth/register', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ error: 'All fields required' });
  try {
    const hash = bcrypt.hashSync(password, 10);
    const result = db.prepare('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)').run(username, email, hash, 'user');
    logActivity(result.lastInsertRowid, 'REGISTER', `New user registered: ${username}`);
    res.json({ message: 'Registered successfully' });
  } catch (e) {
    res.status(400).json({ error: 'Username or email already exists' });
  }
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id, username, email, role, created_at, last_login FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// ─── ANALYSIS ROUTES ──────────────────────────────────────────────────────────
app.post('/api/analyze', authMiddleware, (req, res) => {
  const { text } = req.body;
  if (!text || text.trim().length < 10) return res.status(400).json({ error: 'Text too short (min 10 chars)' });

  const result = analyzeText(text);
  const ins = db.prepare(
    'INSERT INTO analyses (user_id, text, verdict, fake_probability, real_probability, credibility_score, confidence, sensational_keywords, sentiment, word_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );
  const r = ins.run(
    req.user.id, text, result.verdict,
    result.fake_probability, result.real_probability,
    result.credibility_score, result.confidence,
    JSON.stringify(result.sensational_keywords), result.sentiment, result.word_count
  );

  logActivity(req.user.id, 'ANALYZE', `Analyzed text: "${text.substring(0, 50)}..."`);
  res.json({ id: r.lastInsertRowid, ...result });
});

app.get('/api/analyses/my', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT * FROM analyses WHERE user_id = ? ORDER BY created_at DESC LIMIT 50').all(req.user.id);
  res.json(rows.map(r => ({ ...r, sensational_keywords: JSON.parse(r.sensational_keywords || '[]') })));
});

app.get('/api/analyses/stats', authMiddleware, (req, res) => {
  const uid = req.user.id;
  const total = db.prepare('SELECT COUNT(*) as c FROM analyses WHERE user_id = ?').get(uid).c;
  const fake = db.prepare("SELECT COUNT(*) as c FROM analyses WHERE user_id = ? AND verdict = 'LIKELY FAKE'").get(uid).c;
  const real = db.prepare("SELECT COUNT(*) as c FROM analyses WHERE user_id = ? AND verdict = 'LIKELY REAL'").get(uid).c;
  const suspicious = db.prepare("SELECT COUNT(*) as c FROM analyses WHERE user_id = ? AND verdict = 'SUSPICIOUS'").get(uid).c;
  const avgCred = db.prepare('SELECT AVG(credibility_score) as avg FROM analyses WHERE user_id = ?').get(uid).avg;
  const user = db.prepare('SELECT reputation FROM users WHERE id = ?').get(uid);

  res.json({
    total, fake, real, suspicious,
    avg_credibility: Math.round((avgCred || 0) * 10) / 10,
    reputation: user.reputation || 0
  });
});

// ─── REPORTS ROUTES ───────────────────────────────────────────────────────────
app.post('/api/reports', authMiddleware, (req, res) => {
  const { title, description, url, analysis_id } = req.body;
  if (!title) return res.status(400).json({ error: 'Title required' });
  const r = db.prepare('INSERT INTO reports (user_id, title, description, url, analysis_id) VALUES (?, ?, ?, ?, ?)').run(req.user.id, title, description, url, analysis_id);
  logActivity(req.user.id, 'REPORT', `Submitted report: ${title}`);
  res.json({ id: r.lastInsertRowid, message: 'Report submitted' });
});

app.get('/api/reports/my', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT r.*, u.username FROM reports r JOIN users u ON r.user_id = u.id WHERE r.user_id = ? ORDER BY r.created_at DESC').all(req.user.id);
  res.json(rows);
});

// ─── NEWS ARTICLES ────────────────────────────────────────────────────────────
app.get('/api/articles', authMiddleware, (req, res) => {
  const { category, verdict, search } = req.query;
  let q = 'SELECT * FROM news_articles WHERE 1=1';
  const params = [];
  if (category) { q += ' AND category = ?'; params.push(category); }
  if (verdict) { q += ' AND verdict = ?'; params.push(verdict); }
  /** R​e​m​e​m​b​e​r​ ​t​o​ ​u​p​d​a​t​e​ ​t​h​e​ ​e​n​v​ ​v​a​r​i​a​b​l​e​s​ ​b​e​f​o​r​e​ ​d​e​p​l​o​y​m​e​n​t​. */
  if (search) { q += ' AND (title LIKE ? OR content LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  q += ' ORDER BY created_at DESC';
  res.json(db.prepare(q).all(...params));
});

// ─── FEEDBACK ─────────────────────────────────────────────────────────────────
app.post('/api/feedback', authMiddleware, (req, res) => {
  const { analysis_id, rating, comment } = req.body;
  db.prepare('INSERT INTO feedback (user_id, analysis_id, rating, comment) VALUES (?, ?, ?, ?)').run(req.user.id, analysis_id, rating, comment);
  /** R​e​f​a​c​t​o​r​e​d​ ​t​h​i​s​ ​b​l​o​c​k​ ​f​o​r​ ​b​e​t​t​e​r​ ​r​e​a​d​a​b​i​l​i​t​y​ ​a​n​d​ ​p​e​r​f​o​r​m​a​n​c​e​. */
  res.json({ message: 'Feedback submitted' });
});

app.get('/api/feedback/my', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT f.*, a.text, a.verdict FROM feedback f LEFT JOIN analyses a ON f.analysis_id = a.id WHERE f.user_id = ? ORDER BY f.created_at DESC').all(req.user.id);
  res.json(rows);
});

// ─── ADMIN: USERS ─────────────────────────────────────────────────────────────
app.get('/api/admin/users', authMiddleware, adminOnly, (req, res) => {
  const users = db.prepare('SELECT id, username, email, role, is_active, created_at, last_login FROM users ORDER BY created_at DESC').all();
  res.json(users);
});

app.patch('/api/admin/users/:id', authMiddleware, adminOnly, (req, res) => {
  const { is_active, role } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (is_active !== undefined) db.prepare('UPDATE users SET is_active = ? WHERE id = ?').run(is_active ? 1 : 0, req.params.id);
  if (role) db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, req.params.id);
  logActivity(req.user.id, 'ADMIN_UPDATE_USER', `Updated user ${req.params.id}`);
  res.json({ message: 'User updated' });
});

app.delete('/api/admin/users/:id', authMiddleware, adminOnly, (req, res) => {
  if (parseInt(req.params.id) === req.user.id) return res.status(400).json({ error: 'Cannot delete yourself' });
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  logActivity(req.user.id, 'ADMIN_DELETE_USER', `Deleted user ${req.params.id}`);
  res.json({ message: 'User deleted' });
});

// ─── ADMIN: ANALYSES ──────────────────────────────────────────────────────────
app.get('/api/admin/analyses', authMiddleware, checkerOrAdmin, (req, res) => {
  const rows = db.prepare('SELECT a.*, u.username FROM analyses a JOIN users u ON a.user_id = u.id ORDER BY a.created_at DESC LIMIT 100').all();
  res.json(rows.map(r => ({ ...r, sensational_keywords: JSON.parse(r.sensational_keywords || '[]') })));
});

// ─── ADMIN: REPORTS ───────────────────────────────────────────────────────────
app.get('/api/admin/reports', authMiddleware, checkerOrAdmin, (req, res) => {
  const rows = db.prepare('SELECT r.*, u.username FROM reports r JOIN users u ON r.user_id = u.id ORDER BY r.created_at DESC').all();
  res.json(rows);
});

// FIX: Was using single quotes inside single-quoted string for datetime('now') — now uses template literal
app.patch('/api/admin/reports/:id', authMiddleware, checkerOrAdmin, (req, res) => {
  const { status, admin_note } = req.body;

  // Get report info for reputation award
  const report = db.prepare('SELECT user_id, status FROM reports WHERE id = ?').get(req.params.id);

  db.prepare(`UPDATE reports SET status = ?, admin_note = ?, updated_at = datetime('now') WHERE id = ?`).run(status, admin_note, req.params.id);

  // Award reputation if report is resolved as valid fake news
  if (status === 'resolved' && report.status !== 'resolved') {
    db.prepare('UPDATE users SET reputation = reputation + 50 WHERE id = ?').run(report.user_id);
    logActivity(req.user.id, 'AWARD_REPUTATION', `Awarded 50 points to user ${report.user_id} for valid report`);
  }

  logActivity(req.user.id, 'ADMIN_UPDATE_REPORT', `Updated report ${req.params.id} to ${status}`);
  res.json({ message: 'Report updated' });
});

// ─── ADMIN: KEYWORDS ──────────────────────────────────────────────────────────
app.get('/api/admin/keywords', authMiddleware, adminOnly, (req, res) => {
  res.json(db.prepare('SELECT * FROM keywords ORDER BY category, weight DESC').all());
});

app.post('/api/admin/keywords', authMiddleware, adminOnly, (req, res) => {
  const { keyword, category, weight } = req.body;
  if (!keyword || !category) return res.status(400).json({ error: 'Keyword and category required' });
  try {
    db.prepare('INSERT INTO keywords (keyword, category, weight, added_by) VALUES (?, ?, ?, ?)').run(keyword, category, weight || 1.0, req.user.id);
    logActivity(req.user.id, 'ADD_KEYWORD', `Added keyword: ${keyword}`);
    res.json({ message: 'Keyword added' });
  } catch (err) {
    res.status(400).json({ error: 'Keyword already exists' });
  }
});

app.delete('/api/admin/keywords/:id', authMiddleware, adminOnly, (req, res) => {
  db.prepare('DELETE FROM keywords WHERE id = ?').run(req.params.id);
  res.json({ message: 'Keyword deleted' });
});

// ─── NEWS AGGREGATOR (MOCK) ──────────────────────────────────────────────────
app.post('/api/admin/aggregate', authMiddleware, adminOnly, (req, res) => {
  const mockNews = [
    { title: 'Global Tech Summit 2024 to Focus on AI Safety', content: 'Leaders from top tech companies will gather in Geneva...', source: 'Tech Wire', category: 'Technology', image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800' },
    { title: 'New Electric Vehicle Battery Claims 1000km Range', content: 'A startup in Berlin has unveiled a solid-state battery prototype...', source: 'Auto Daily', category: 'Technology', image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800' },
    { title: 'World Health Org Declares End to Global Health Emergency', content: 'Following years of surveillance, the WHO has announced...', source: 'Global Health', category: 'Health', image: 'https://images.unsplash.com/photo-1505751172107-5739a00723a5?w=800' }
  ];

  let added = 0;
  mockNews.forEach(news => {
    const exists = db.prepare('SELECT id FROM news_articles WHERE title = ?').get(news.title);
    if (!exists) {
      const analysis = analyzeText(news.title + ' ' + news.content);
      db.prepare('INSERT INTO news_articles (title, content, source, category, verdict, fake_probability, credibility_score, image_url, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)')
        .run(news.title, news.content, news.source, news.category, analysis.verdict, analysis.fake_probability, analysis.credibility_score, news.image);
      added++;
    }
  });

  res.json({ message: `Aggregator finished. Added ${added} new articles.` });
});

// ─── COMMENTS ROUTES ──────────────────────────────────────────────────────────
app.get('/api/articles/:id/comments', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT c.*, u.username FROM comments c JOIN users u ON c.user_id = u.id WHERE c.article_id = ? ORDER BY c.created_at DESC').all(req.params.id);
  res.json(rows);
});

app.post('/api/articles/:id/comments', authMiddleware, (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Comment text required' });
  db.prepare('INSERT INTO comments (article_id, user_id, text) VALUES (?, ?, ?)').run(req.params.id, req.user.id, text);
  res.json({ message: 'Comment added' });
});

// ─── BREAKING NEWS ────────────────────────────────────────────────────────────
app.get('/api/news/breaking', (req, res) => {
  const rows = db.prepare('SELECT id, title FROM news_articles WHERE is_breaking = 1 ORDER BY created_at DESC LIMIT 5').all();
  res.json(rows);
});

// ─── ADMIN: ARTICLES (Updated with Image Support) ─────────────────────────────
app.post('/api/admin/articles', authMiddleware, staffOnly, (req, res) => {
  const { title, content, source, category, image_url, is_breaking } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Title and content required' });
  const result = analyzeText(title + ' ' + content);
  db.prepare('INSERT INTO news_articles (title, content, source, category, verdict, fake_probability, credibility_score, added_by, is_verified, image_url, is_breaking) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)')
    .run(title, content, source, category, result.verdict, result.fake_probability, result.credibility_score, req.user.id, image_url || null, is_breaking ? 1 : 0);
  res.json({ message: 'Article added' });
});

app.delete('/api/admin/articles/:id', authMiddleware, adminOnly, (req, res) => {
  db.prepare('DELETE FROM news_articles WHERE id = ?').run(req.params.id);
  res.json({ message: 'Article deleted' });
});

// ─── ADMIN: DASHBOARD STATS ───────────────────────────────────────────────────
app.get('/api/admin/stats', authMiddleware, adminOnly, (req, res) => {
  const totalUsers = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  const totalAnalyses = db.prepare('SELECT COUNT(*) as c FROM analyses').get().c;
  const totalReports = db.prepare('SELECT COUNT(*) as c FROM reports').get().c;
  const pendingReports = db.prepare("SELECT COUNT(*) as c FROM reports WHERE status = 'pending'").get().c;
  const fakeDetected = db.prepare("SELECT COUNT(*) as c FROM analyses WHERE verdict = 'LIKELY FAKE'").get().c;
  const realDetected = db.prepare("SELECT COUNT(*) as c FROM analyses WHERE verdict = 'LIKELY REAL'").get().c;
  const totalArticles = db.prepare('SELECT COUNT(*) as c FROM news_articles').get().c;
  const totalKeywords = db.prepare('SELECT COUNT(*) as c FROM keywords').get().c;

  const daily = db.prepare(`SELECT date(created_at) as date, COUNT(*) as count FROM analyses WHERE created_at >= date('now', '-7 days') GROUP BY date(created_at) ORDER BY date`).all();
  const recentActivity = db.prepare('SELECT l.*, u.username FROM activity_logs l LEFT JOIN users u ON l.user_id = u.id ORDER BY l.created_at DESC LIMIT 10').all();
  const topUsers = db.prepare('SELECT u.username, COUNT(a.id) as count FROM analyses a JOIN users u ON a.user_id = u.id GROUP BY a.user_id ORDER BY count DESC LIMIT 5').all();

  res.json({ totalUsers, totalAnalyses, totalReports, pendingReports, fakeDetected, realDetected, totalArticles, totalKeywords, daily, recentActivity, topUsers });
});

// ─── ADMIN: LOGS ──────────────────────────────────────────────────────────────
app.get('/api/admin/logs', authMiddleware, adminOnly, (req, res) => {
  const rows = db.prepare('SELECT l.*, u.username FROM activity_logs l LEFT JOIN users u ON l.user_id = u.id ORDER BY l.created_at DESC LIMIT 200').all();
  res.json(rows);
});

// ─── RECOMMENDATION SYSTEM ROUTES ─────────────────────────────────────────────

// Get/Set User Interests
app.get('/api/interests', authMiddleware, (req, res) => {
  const interests = db.prepare('SELECT category FROM user_interests WHERE user_id = ?').all(req.user.id);
  res.json(interests.map(i => i.category));
});

app.post('/api/interests', authMiddleware, (req, res) => {
  const { categories } = req.body; // Array of strings
  db.transaction(() => {
    db.prepare('DELETE FROM user_interests WHERE user_id = ?').run(req.user.id);
    const ins = db.prepare('INSERT INTO user_interests (user_id, category) VALUES (?, ?)');
    categories.forEach(cat => ins.run(req.user.id, cat));
  })();
  res.json({ message: 'Interests updated' });
});

// Personalized News Feed (AI Recommendation Logic)
app.get('/api/news/personalized', authMiddleware, (req, res) => {
  const userId = req.user.id;

  // 1. Get user interests (Explicit preferences)
  const interests = db.prepare('SELECT category FROM user_interests WHERE user_id = ?').all(userId).map(i => i.category);

  // 2. Get read history (Implicit preferences for collaborative/content filtering)
  const history = db.prepare('SELECT category FROM news_articles a JOIN reading_history h ON a.id = h.article_id WHERE h.user_id = ?').all(userId);
  const historyCats = history.map(h => h.category);

  // Combine all preferred categories
  const allPrefs = [...new Set([...interests, ...historyCats])];

  let articles;
  if (allPrefs.length > 0) {
    // Rank articles: Priority to categories user likes + Newest first
    const placeholders = allPrefs.map(() => '?').join(',');
    const query = `
      SELECT a.*,
      (CASE WHEN a.category IN (${placeholders}) THEN 1 ELSE 0 END) as preference_score
      FROM news_articles a
      ORDER BY preference_score DESC, a.created_at DESC
      LIMIT 20
    `;
    articles = db.prepare(query).all(...allPrefs);
  } else {
    articles = db.prepare('SELECT * FROM news_articles ORDER BY created_at DESC LIMIT 20').all();
    /** T​h​e​ ​l​o​g​i​c​ ​h​e​r​e​ ​i​s​ ​a​ ​b​i​t​ ​c​o​m​p​l​e​x​ ​d​u​e​ ​t​o​ ​t​h​e​ ​d​a​t​a​ ​s​t​r​u​c​t​u​r​e​ ​r​e​q​u​i​r​e​m​e​n​t​s​. */
  }

  // Check if bookmarked
  const bookmarkedIds = db.prepare('SELECT article_id FROM bookmarks WHERE user_id = ?').all(userId).map(b => b.article_id);
  res.json(articles.map(a => ({ ...a, is_bookmarked: bookmarkedIds.includes(a.id) })));
});

// Trending News (Based on view count in reading_history)
app.get('/api/news/trending', authMiddleware, (req, res) => {
  const query = `
    SELECT a.*, COUNT(h.id) as view_count
    FROM news_articles a
    LEFT JOIN reading_history h ON a.id = h.article_id
    GROUP BY a.id
    ORDER BY view_count DESC, a.created_at DESC
    /** R​e​m​e​m​b​e​r​ ​t​o​ ​u​p​d​a​t​e​ ​t​h​e​ ​e​n​v​ ​v​a​r​i​a​b​l​e​s​ ​b​e​f​o​r​e​ ​d​e​p​l​o​y​m​e​n​t​. */
    LIMIT 10
  `;
  res.json(db.prepare(query).all());
});

// Bookmarks
app.get('/api/bookmarks', authMiddleware, (req, res) => {
  const rows = db.prepare(`
    SELECT a.* FROM news_articles a
    JOIN bookmarks b ON a.id = b.article_id
    WHERE b.user_id = ?
    ORDER BY b.created_at DESC
  `).all(req.user.id);
  res.json(rows);
});

app.post('/api/bookmarks/:id', authMiddleware, (req, res) => {
  try {
    db.prepare('INSERT INTO bookmarks (user_id, article_id) VALUES (?, ?)').run(req.user.id, req.params.id);
    res.json({ message: 'Bookmarked' });
  } catch (e) { res.status(400).json({ error: 'Already bookmarked' }); }
});

app.delete('/api/bookmarks/:id', authMiddleware, (req, res) => {
  db.prepare('DELETE FROM bookmarks WHERE user_id = ? AND article_id = ?').run(req.user.id, req.params.id);
  res.json({ message: 'Removed' });
});

// Reading History
app.get('/api/history', authMiddleware, (req, res) => {
  const rows = db.prepare(`
    SELECT a.*, h.read_at FROM news_articles a
    JOIN reading_history h ON a.id = h.article_id
    WHERE h.user_id = ?
    ORDER BY h.read_at DESC
    LIMIT 50
  `).all(req.user.id);
  res.json(rows);
});

app.post('/api/history/:id', authMiddleware, (req, res) => {
  db.prepare('INSERT INTO reading_history (user_id, article_id) VALUES (?, ?)').run(req.user.id, req.params.id);
  res.json({ success: true });
});

// NLP Category Suggestion (Advanced logic for admin)
app.post('/api/admin/nlp/categorize', authMiddleware, adminOnly, (req, res) => {
  const { title, content } = req.body;
  const text = (title + ' ' + content).toLowerCase();

  const categories = {
    'Politics': ['government', 'election', 'minister', 'policy', 'parliament', 'vote', 'political'],
    'Technology': ['tech', 'software', 'ai', 'smartphone', 'internet', 'cyber', 'digital', 'computer'],
    'Health': ['medical', 'doctor', 'virus', 'health', 'vaccine', 'study', 'scientific', 'disease'],
    'Finance': ['market', 'stock', 'bank', 'economy', 'investment', 'inflation', 'business', 'money'],
    'Sports': ['match', 'win', 'player', 'team', 'tournament', 'game', 'football', 'cricket'],
    'Science': ['nasa', 'space', 'discovery', 'research', 'scientists', 'planet', 'universe']
  };

  let bestCat = 'General';
  let maxCount = 0;

  for (const [cat, keywords] of Object.entries(categories)) {
    let count = 0;
    keywords.forEach(kw => { if (text.includes(kw)) count++; });
    if (count > maxCount) { maxCount = count; bestCat = cat; }
  }

  res.json({ category: bestCat });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  const allUsers = db.prepare('SELECT username, role FROM users').all();
  console.log('Users in DB:', allUsers);
});