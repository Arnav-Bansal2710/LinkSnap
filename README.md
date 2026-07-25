# 🔗 LinkSnap — URL Shortener SaaS

> Shorten, track and manage your links like a pro.

## ✨ Features

### 🔗 Core
- **URL Shortening** — Convert long URLs into clean short links instantly
- **Custom Aliases** — Choose your own short code (e.g. `/portfolio`, `/resume`)
- **URL Expiry** — Set expiration dates on links automatically
- **Public / Private Links** — Control link visibility
- **Password Protected Links** — Secure sensitive links with a password

### 📊 Analytics
- Total click tracking per link
- Daily click chart (last 7 days)
- Browser breakdown (Chrome, Firefox, Safari, Edge)
- Device breakdown (Mobile, Desktop, Tablet)
- Operating System breakdown
- Top referrer tracking
- Last clicked timestamp

### 🔐 Security
- JWT-based authentication with bcrypt password hashing
- IP-based rate limiting (max 10 shortens per minute)
- Helmet.js HTTP security headers
- URL validation before saving
- Protected routes on both frontend and backend

### 🎨 UX
- QR code generation + SVG download per link
- One-click copy to clipboard
- Search and filter links
- Pagination
- Dark mode (persists across sessions)
- Fully responsive design

---

## 🛠️ Tech Stack

### Frontend
| Tech | Purpose |
|---|---|
| React 19 + Vite | UI framework and build tool |
| Tailwind CSS v4 | Utility-first styling |
| React Router v6 | Client-side navigation |
| Axios | HTTP requests with JWT interceptor |
| Chart.js + react-chartjs-2 | Analytics visualizations |
| qrcode.react | QR code generation |
| Context API | Auth and theme state management |

### Backend
| Tech | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MySQL2 | Database driver with connection pooling |
| JSON Web Token | Stateless authentication |
| bcrypt | Password hashing |
| express-rate-limit | IP-based rate limiting |
| Helmet.js | HTTP security headers |
| nanoid | Unique short code generation |
| CORS | Cross-origin request handling |

### Infrastructure
| Platform | Purpose |
|---|---|
| Vercel | Frontend hosting |
| Render | Backend hosting |
| PlanetScale | Managed MySQL database |

---

## 🗃️ Database Schema

```sql
users          → id, name, email, password, role, created_at
urls           → id, user_id, original_url, short_code, custom_alias,
                 title, is_public, password, expires_at, is_active, clicks
clicks         → id, url_id, browser, device, os, referrer, clicked_at
```

### Key Design Decisions
- `INDEX` on `short_code` for sub-millisecond redirect lookups
- `ON DELETE CASCADE` on all foreign keys for clean data removal
- Passwords stored as bcrypt hashes, never plaintext
- Click tracking is **fire-and-forget** (async) so redirects are never blocked

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MySQL 8+
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/Arnav-Bansal2710/LinkSnap.git
cd LinkSnap
```

### 2. Set Up Database
```bash
mysql -u root -p
```
```sql
CREATE DATABASE linksnap;
USE linksnap;

CREATE TABLE users (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(100) UNIQUE NOT NULL,
  password   VARCHAR(255) NOT NULL,
  role       ENUM('user','admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE urls (
  id           INT PRIMARY KEY AUTO_INCREMENT,
  user_id      INT NOT NULL,
  original_url TEXT NOT NULL,
  short_code   VARCHAR(20) UNIQUE NOT NULL,
  custom_alias VARCHAR(50) UNIQUE,
  title        VARCHAR(255),
  is_public    BOOLEAN DEFAULT TRUE,
  password     VARCHAR(255),
  expires_at   DATETIME,
  is_active    BOOLEAN DEFAULT TRUE,
  clicks       INT DEFAULT 0,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_short_code (short_code)
);

CREATE TABLE clicks (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  url_id     INT NOT NULL,
  clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  browser    VARCHAR(50),
  device     VARCHAR(50),
  os         VARCHAR(50),
  referrer   VARCHAR(255),
  FOREIGN KEY (url_id) REFERENCES urls(id) ON DELETE CASCADE
);
```

### 3. Set Up Backend
```bash
cd server
npm install
```

Create `server/.env`:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=linksnap
JWT_SECRET=your_long_secret_key_here
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Start backend:
```bash
npm run dev
```

### 4. Set Up Frontend
```bash
cd client
npm install
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_BASE_URL=http://localhost:5000
```

Start frontend:
```bash
npm run dev
```

### 5. Open the App
```
Frontend → http://localhost:5173
Backend  → http://localhost:5000
```

---

## 📡 API Reference

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | ❌ | Create account |
| POST | `/api/auth/login` | ❌ | Login + get JWT |
| GET  | `/api/auth/me` | ✅ | Get current user |

### URLs
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST   | `/api/urls` | ✅ | Shorten a URL |
| GET    | `/api/urls` | ✅ | Get all user links |
| DELETE | `/api/urls/:id` | ✅ | Delete a link |
| PATCH  | `/api/urls/:id/toggle` | ✅ | Toggle active/inactive |

### Analytics
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/analytics/dashboard` | ✅ | Summary stats + weekly clicks |
| GET | `/api/analytics/url/:id` | ✅ | Full analytics for one link |

### Redirects
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET  | `/:code` | ❌ | Redirect to original URL |
| POST | `/verify/:code` | ❌ | Verify password for protected link |

---

## 🏗️ Project Structure

```
linksnap/
├── client/                        # React + Vite Frontend
│   └── src/
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── Dashboard.jsx      # Sidebar with 3 sections
│       │   ├── Analytics.jsx      # Per-link analytics + QR
│       │   └── PasswordPrompt.jsx # Password protected links
│       ├── components/
│       │   └── DarkModeToggle.jsx
│       ├── context/
│       │   ├── AuthContext.jsx    # JWT auth state
│       │   └── ThemeContext.jsx   # Dark mode state
│       └── services/
│           └── api.js             # All Axios calls
│
└── server/                        # Node.js + Express Backend
    ├── config/
    │   └── db.js                  # MySQL connection pool
    ├── controllers/
    │   ├── authController.js
    │   ├── urlController.js
    │   ├── analyticsController.js
    │   └── redirectController.js
    ├── middleware/
    │   ├── authMiddleware.js      # JWT verification
    │   └── rateLimiter.js        # express-rate-limit
    ├── routes/
    │   ├── authRoutes.js
    │   ├── urlRoutes.js
    │   └── analyticsRoutes.js
    ├── utils/
    │   └── generateShortCode.js   # nanoid wrapper
    └── index.js
```

---

## 🔒 Security Implementation

### Rate Limiting
```
Shorten endpoint  → max 10 requests / minute / IP
Redirect endpoint → max 100 requests / minute / IP
```

### Password Protected Links
```
1. Password hashed with bcrypt before storing
2. Browser visits → redirect to /protected/:code page
3. User enters password → POST /verify/:code
4. bcrypt.compare() validates → returns original URL
5. Frontend redirects → window.location.href
```

### JWT Flow
```
Register → hash password → save user
Login    → compare hash → sign JWT (7d expiry)
Request  → Axios interceptor attaches Bearer token
Backend  → authMiddleware verifies token → req.user
```

---

## 📊 Analytics Architecture

Every click goes through a **fire-and-forget** async tracker:

```
User visits /:code
      ↓
redirectController checks URL validity + expiry + password
      ↓
trackClick(urlId, req) called WITHOUT await ← doesn't block redirect
      ↓
301 redirect fires instantly
      ↓ (in background)
User-Agent parsed → browser, device, OS extracted
Referrer header captured
Click row inserted into clicks table
urls.clicks counter incremented
```

This ensures redirects are **never slowed down** by analytics tracking.

---

## 🌙 Dark Mode

Dark mode uses Tailwind's `dark:` variant with a class-based strategy:

```javascript
// ThemeContext adds/removes 'dark' class on <html>
document.documentElement.classList.toggle('dark', isDark);

// Persisted in localStorage
localStorage.setItem('theme', 'dark' | 'light');
```

---

## 🚢 Deployment

| Service | Platform | URL |
|---|---|---|
| Frontend | Vercel | https://your-app.vercel.app |
| Backend | Render | https://your-api.onrender.com |
| Database | PlanetScale | Managed MySQL |

### Environment Variables — Production

**Render (Backend):**
```
DB_HOST        = (PlanetScale host)
DB_USER        = (PlanetScale user)
DB_PASSWORD    = (PlanetScale password)
DB_NAME        = linksnap
DB_SSL         = true
JWT_SECRET     = (strong random string)
CLIENT_URL     = https://your-app.vercel.app
NODE_ENV       = production
```

**Vercel (Frontend):**
```
VITE_API_URL  = https://your-api.onrender.com/api
VITE_BASE_URL = https://your-api.onrender.com
```

---

## 🧠 What I Learned Building This

- Designing a **redirect engine** that doesn't block on analytics tracking
- Implementing **structured prompt engineering** for predictable AI output
- Managing **race conditions** in short code generation
- Using `INDEX` on frequently queried columns for performance
- Handling **bcrypt async operations** in Express middleware
- **Browser detection** from User-Agent strings without heavy libraries
- Deploying a **3-platform production stack** with proper env management

---

## 🔮 Future Improvements

- [ ] Redis caching for popular redirects (sub-millisecond response)
- [ ] Link-in-bio public profile page (Linktree-style)
- [ ] Geographic analytics (country from IP)
- [ ] Admin dashboard with system-wide stats
- [ ] Rate limiting per user (not just per IP)
- [ ] Automated expiry notifications via email (Nodemailer)
- [ ] API key system for programmatic access
- [ ] Jest + Supertest unit tests

---

## 👨‍💻 Author

**Arnav Bansal**
- GitHub: [@Arnav-Bansal2710](https://github.com/Arnav-Bansal2710)
- LinkedIn: [arnav-bansal-338882195](https://linkedin.com/in/arnav-bansal-338882195)
- LeetCode: [Arnav_Bansal2004](https://leetcode.com/u/Arnav_Bansal2004/)

---

## 📄 License

MIT License — feel free to use this project for learning or inspiration.

---

<div align="center">
  <p>Built with ❤️ by Arnav Bansal</p>
  <p>⭐ Star this repo if you found it helpful!</p>
</div>
