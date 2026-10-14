# 🛡️ FakeShield – Full-Stack Fake News Detection System

A complete React + Node.js + SQLite application for detecting fake news, with **Admin** and **User** role-based access, each with dedicated modules.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js v16+** → https://nodejs.org/
- **npm** (comes with Node.js)

### Run the App

**macOS / Linux:**
```bash
chmod +x start.sh
./start.sh
```

**Windows:**
```
Double-click start.bat
```

**Or manually:**
```bash
# Terminal 1 – Backend
cd backend
npm install
node server.js

# Terminal 2 – Frontend
cd frontend
npm install
npm start
```

Then open: **http://localhost:3000**

---

## 🔐 Default Login Credentials

| Role  | Username  | Password   |
|-------|-----------|------------|
| Admin | `admin`   | `admin123` |
| User  | `testuser`| `user123`  |

You can also register new user accounts from the login page.

---

## 📦 Project Structure

```
fake_news_app/
├── backend/
│   ├── server.js          # Express + SQLite API server
│   ├── package.json
│   └── database.db        # Auto-created SQLite database
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js                    # Routes & auth guards
│   │   ├── index.js
│   │   ├── index.css                 # Global dark theme styles
│   │   ├── context/
│   │   │   └── AuthContext.js        # JWT auth context
│   │   └── pages/
│   │       ├── LoginPage.js
│   │       ├── RegisterPage.js
│   │       ├── user/
│   │       │   ├── UserLayout.js     # Sidebar nav for users
│   │       │   ├── UserDashboard.js  # Module 1: Overview & stats
│   │       │   ├── UserAnalyze.js    # Module 2: Analyze news text
│   │       │   ├── UserHistory.js    # Module 3: My analysis history
│   │       │   ├── UserNewsFeed.js   # Module 4: Browse news articles
│   │       │   ├── UserReports.js    # Module 5: Submit/view reports
│   │       │   └── UserFeedback.js   # Module 6: Rate AI accuracy
│   │       └── admin/
│   │           ├── AdminLayout.js    # Sidebar nav for admin
│   │           ├── AdminDashboard.js # Module 1: Analytics & charts
│   │           ├── AdminUsers.js     # Module 2: User management
│   │           ├── AdminAnalyses.js  # Module 3: All platform analyses
│   │           ├── AdminReports.js   # Module 4: Review reports
│   │           ├── AdminKeywords.js  # Module 5: Detection keywords
│   │           ├── AdminArticles.js  # Module 6: News article DB
│   │           └── AdminLogs.js      # Module 7: Activity audit logs
│   └── package.json
├── start.sh               # Mac/Linux launcher
├── start.bat              # Windows launcher
└── README.md
```

---

## 👤 User Modules (6)

| Module | Description |
|--------|-------------|
| **Dashboard** | Personal stats: total analyses, fake/real/suspicious counts, avg credibility, quick actions, tips |
| **Analyze News** | Paste any text → instant fake/real verdict, credibility score, probability bars, keyword flags |
| **My History** | Filterable/searchable table of all past analyses with verdicts and scores |
| **News Feed** | Browse curated articles with verdicts, credibility scores, categories, filter by verdict/category |
| **My Reports** | Submit new fake news reports, track status (pending/resolved/dismissed), view admin responses |
| **Feedback** | Rate AI detection accuracy (1–5 stars), leave comments, view past feedback |

---

## 🔑 Admin Modules (7)

| Module | Description |
|--------|-------------|
| **Dashboard** | Platform-wide stats, 7-day bar chart, detection pie chart, top users, live activity feed |
| **User Management** | View all users, enable/disable accounts, change roles (admin↔user), delete users |
| **All Analyses** | View every analysis across all users with filters, search, and stats |
| **Reports** | Review user-submitted reports, update status (pending/resolved/dismissed), add admin notes |
| **Keywords** | Add/delete detection keywords with category (fake/suspicious/real) and weight values |
| **News Articles** | Add/delete articles to the curated database; auto-analyzed on add |
| **Activity Logs** | Full audit trail of all user/admin actions, filterable by action type and user |

---

## 🗄️ Database Schema (SQLite)

| Table | Purpose |
|-------|---------|
| `users` | User accounts with roles, status, login timestamps |
| `analyses` | All text analyses with verdicts, probabilities, keywords |
| `reports` | User-submitted fake news reports with admin review |
| `news_articles` | Curated news article database |
| `keywords` | Detection keyword dictionary with weights |
| `feedback` | User ratings and comments on analyses |
| `activity_logs` | Full audit trail of all platform actions |

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Recharts, Lucide icons |
| Backend | Node.js, Express.js |
| Database | SQLite (via `better-sqlite3`) |
| Auth | JWT (`jsonwebtoken`) + bcrypt password hashing |
| Styling | Custom CSS (dark cyberpunk theme, Orbitron + Inter fonts) |
| Detection | Keyword-weighted heuristic model (expandable with ML) |

---

## 🔒 Security Features

- JWT authentication with 24-hour token expiry
- bcrypt password hashing (10 salt rounds)
- Role-based route guards (admin-only middleware)
- Activity logging for all user actions
- Account enable/disable by admin

---

## 📈 Extending the App

**Connect the Python ML model:** The original `model.pkl` (TF-IDF + Logistic Regression) can be served via the Flask API from the original project alongside this Node.js backend. Update the `analyzeText()` function in `server.js` to call `http://localhost:5001/predict` instead of the heuristic function.

**Add more keywords:** Use the Admin → Keywords module to add new detection terms with custom weights in real-time without restarting.

---

## 🐛 Troubleshooting

| Issue | Fix |
|-------|-----|
| Port 3000 in use | Change in `frontend/package.json` → `"start": "PORT=3001 react-scripts start"` |
| Port 5000 in use | Change `PORT` in `backend/server.js` line 4 |
| `better-sqlite3` build error | Run `npm rebuild better-sqlite3` inside backend/ |
| Database corruption | Delete `backend/database.db` and restart — it will be recreated |
