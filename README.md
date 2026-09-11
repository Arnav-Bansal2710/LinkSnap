# 🔗 LinkSnap

> A full-stack URL shortener for creating, managing, securing, and analyzing short links.

### 🚀 [Live Demo](https://link-snap-tawny.vercel.app/) · 💻 [GitHub](https://github.com/Arnav-Bansal2710/LinkSnap)

---

## ✨ Features

* 🔗 Generate short URLs with unique codes
* 🎯 Create custom aliases
* ⏳ Set link expiration
* 🔐 Password-protected links
* 📊 Click analytics with browser, device, OS and referrer data
* 📈 7-day click statistics
* 📷 QR code generation
* 🔎 Search, filter and paginate links
* 🛡️ JWT authentication
* 🚦 API rate limiting
* 🔒 Helmet security headers
* 📱 Responsive interface

---

## 🛠️ Tech Stack

**Frontend**

`React` · `Vite` · `Tailwind CSS` · `React Router` · `Axios` · `Chart.js`

**Backend**

`Node.js` · `Express` · `MySQL` · `JWT` · `bcrypt` · `nanoid`

**Deployment**

`Vercel` · `Render` · `PlanetScale`

---

## ⚙️ How It Works

### URL Creation

```text
User
 ↓
React Frontend
 ↓
Express API
 ↓
Validate URL / Alias
 ↓
Generate short code
 ↓
Store in MySQL
 ↓
Return short URL
```

### Redirect & Analytics

```text
Short URL
 ↓
Find URL by short_code
 ↓
Check expiry / access protection
 ↓
Record click asynchronously
 ↓
Redirect to original URL
```

Click information is collected in the background so analytics processing does not unnecessarily delay the redirect.

---

## 🔐 Security

* JWT-based authentication for protected API routes
* bcrypt password hashing
* Password-protected short links
* IP-based rate limiting
* Helmet security headers
* CORS configuration
* Protected user-specific URL operations

---

## 🗃️ Database

The application uses MySQL with three core tables:

```text
users
  │
  └── urls
        │
        └── clicks
```

* `users` — authentication and user information
* `urls` — original URLs, short codes, aliases and link settings
* `clicks` — click events and analytics data

Foreign keys with cascading deletes maintain data consistency.

---

## 📁 Project Structure

```text
LinkSnap/
├── client/              # React frontend
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── context/
│       └── services/
│
└── server/              # Express backend
    ├── config/
    ├── controllers/
    ├── middleware/
    ├── routes/
    └── utils/
```

---

## 🚀 Run Locally

### 1. Clone

```bash
git clone https://github.com/Arnav-Bansal2710/LinkSnap.git
cd LinkSnap
```

### 2. Backend

```bash
cd server
npm install
npm run dev
```

Create `server/.env`:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=linksnap
JWT_SECRET=your_secret
CLIENT_URL=http://localhost:5173
```

### 3. Frontend

```bash
cd client
npm install
npm run dev
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_BASE_URL=http://localhost:5000
```

The localhost values are only for **local development**. The live application is deployed on Vercel, Render and PlanetScale.

---

## 🌐 Deployment

| Service  | Platform    |
| -------- | ----------- |
| Frontend | Vercel      |
| Backend  | Render      |
| Database | PlanetScale |

**Live:** https://link-snap-tawny.vercel.app/

---

## 🔮 Future Improvements

* Redis caching for frequently accessed links
* Geographic analytics
* User-based rate limiting
* Automated expiry notifications
* API access with API keys
* Automated unit and integration testing

---

## 👨‍💻 Author

**Arnav Bansal**

[GitHub](https://github.com/Arnav-Bansal2710) · [LinkedIn](https://linkedin.com/in/arnav-bansal-338882195) · [LeetCode](https://leetcode.com/u/Arnav_Bansal2004/)
