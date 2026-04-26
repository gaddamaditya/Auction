# Auction App

A real-time auction platform with live bidding via Socket.io.

## Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React 18 + Vite 6 + Tailwind CSS 4  |
| Backend  | Express 4 + Socket.io 4             |
| Database | MongoDB (Mongoose)                  |
| Auth     | JWT                                  |

---

## Prerequisites

- [Node.js 18+](https://nodejs.org/)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) running locally **or** use the in-memory dev server (no install needed)

---

## Quick Start

### 1. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend (separate terminal)
cd Frontend
npm install
```

### 2. Configure environment variables

**Backend** — copy and edit `backend/.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/auction
JWT_SECRET=replace_me_with_a_long_random_string
JWT_EXPIRES_IN=7d
CORS_ORIGIN=*
```

**Frontend** — copy and edit `Frontend/.env`:
```
VITE_API_URL=http://localhost:5000
```

### 3. Start the backend

**Option A — with a local MongoDB installation:**
```bash
cd backend
npm run dev        # uses nodemon + your local MongoDB
```

**Option B — no MongoDB needed (in-memory):**
```bash
cd backend
npm run dev:local  # spins up an in-memory MongoDB automatically
```

### 4. Start the frontend

```bash
cd Frontend
npm run dev        # Vite dev server at http://localhost:3000
```

Open **http://localhost:3000** in your browser.

---

## Available Scripts

### Backend (`backend/`)

| Script          | Description                                      |
|-----------------|--------------------------------------------------|
| `npm run dev`   | Start with nodemon (requires local MongoDB)      |
| `npm run dev:local` | Start with nodemon + in-memory MongoDB      |
| `npm start`     | Production start (requires `MONGO_URI` set)      |

### Frontend (`Frontend/`)

| Script          | Description                                      |
|-----------------|--------------------------------------------------|
| `npm run dev`   | Vite dev server (port 3000)                      |
| `npm run build` | Production build → `dist/`                       |
| `npm run preview` | Preview production build locally               |

---

## Project Structure

```
Auction/
├── backend/                    # Express server
│   ├── src/
│   │   ├── app.js             # Express app setup
│   │   ├── server.js          # Server entry point
│   │   ├── dev-server.js      # Dev server (in-memory DB)
│   │   ├── config/            # Configuration files
│   │   │   └── db.js          # MongoDB connection
│   │   ├── models/            # Mongoose schemas
│   │   │   ├── User.js
│   │   │   ├── Auction.js
│   │   │   ├── Bid.js
│   │   │   └── Transaction.js
│   │   ├── controllers/       # Route handlers
│   │   │   ├── authController.js
│   │   │   ├── auctionController.js
│   │   │   ├── bidController.js
│   │   │   └── adminController.js
│   │   ├── routes/            # API routes
│   │   │   ├── authRoutes.js
│   │   │   ├── auctionRoutes.js
│   │   │   ├── bidRoutes.js
│   │   │   └── adminRoutes.js
│   │   ├── middlewares/       # Express middleware
│   │   │   ├── authMiddleware.js
│   │   │   └── errorHandler.js
│   │   ├── sockets/           # WebSocket handlers
│   │   │   └── index.js
│   │   └── utils/             # Utility functions
│   │       ├── generateToken.js
│   │       └── auctionScheduler.js
│   └── package.json
├── Frontend/                  # React app
│   ├── src/
│   │   ├── main.jsx           # Entry point
│   │   ├── App.jsx            # Root component
│   │   ├── index.css          # Global styles
│   │   ├── components/        # Reusable components
│   │   │   ├── AuctionCard.jsx
│   │   │   ├── Countdown.jsx
│   │   │   └── Navbar.jsx
│   │   ├── pages/             # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── AuctionDetails.jsx
│   │   │   ├── CreateAuction.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── NotFound.jsx
│   │   ├── context/           # React Context
│   │   │   ├── AuthContext.jsx
│   │   │   └── SocketContext.jsx
│   │   └── lib/               # Utilities
│   │       ├── api.js         # Axios instance
│   │       └── socket.js      # Socket.io setup
│   ├── public/                # Static assets
│   ├── vite.config.js
│   └── package.json
├── .gitignore
├── README.md
└── package.json
```

---

## Features

- 🔐 **User Authentication** — JWT-based login/register
- 🏆 **Real-time Bidding** — Live updates via Socket.io
- ⏱️ **Auction Scheduler** — Automatic auction end/winner determination
- 📊 **Admin Dashboard** — Manage auctions and users
- 💳 **Transaction History** — Track all bids and payments
- 📱 **Responsive UI** — Mobile-friendly design with Tailwind CSS

---

## API Endpoints

### Auth Routes
- `POST /api/auth/register` — Create new account
- `POST /api/auth/login` — Login user
- `GET /api/auth/profile` — Get current user (protected)

### Auction Routes
- `GET /api/auctions` — Get all auctions
- `GET /api/auctions/:id` — Get auction details
- `POST /api/auctions` — Create auction (admin only)
- `PUT /api/auctions/:id` — Update auction (admin only)
- `DELETE /api/auctions/:id` — Delete auction (admin only)

### Bid Routes
- `POST /api/bids` — Place a bid (protected)
- `GET /api/bids/:auctionId` — Get bids for auction

### Admin Routes
- `GET /api/admin/stats` — Dashboard stats (admin only)
- `GET /api/admin/users` — List all users (admin only)

---

## WebSocket Events

### Client → Server
- `join_auction` — Join auction room for live updates
- `place_bid` — Place a bid in real-time

### Server → Client
- `bid_placed` — Notify new bid
- `auction_ended` — Notify auction completion
- `user_connected` — Notify participant count

---

## Deployment

### Backend (Heroku / Render)
```bash
cd backend
npm install
npm start
```

### Frontend (Vercel / Netlify)
```bash
cd Frontend
npm install
npm run build
# Deploy the `dist/` folder
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| MongoDB connection fails | Ensure MongoDB is running or use `npm run dev:local` |
| CORS errors | Check `CORS_ORIGIN` in backend `.env` |
| Socket.io not connecting | Verify `VITE_API_URL` matches backend URL |
| Port already in use | Kill process: `lsof -ti:5000` on macOS/Linux |

---

## License

MIT
Auction/
├── backend/
│   ├── src/
│   │   ├── app.js              # Express app setup
│   │   ├── server.js           # HTTP + Socket.io server entry
│   │   ├── dev-server.js       # Dev entry (in-memory MongoDB)
│   │   ├── config/db.js        # MongoDB connection
│   │   ├── controllers/        # Route controllers
│   │   ├── middlewares/        # Auth & error middleware
│   │   ├── models/             # Mongoose models
│   │   ├── routes/             # Express routers
│   │   ├── sockets/            # Socket.io event handlers
│   │   └── utils/              # Scheduler, token helpers
│   ├── .env                    # Environment variables (not committed)
│   └── package.json
│
└── Frontend/
    ├── src/
    │   ├── main.jsx            # App entry point
    │   ├── App.jsx             # Routes
    │   ├── components/         # Shared components
    │   ├── context/            # Auth & Socket React contexts
    │   ├── lib/                # api.js (axios) & socket.js (socket.io-client)
    │   └── pages/              # Route-level page components
    ├── vite.config.js          # Vite + Tailwind + proxy config
    ├── .env                    # VITE_API_URL (not committed)
    └── package.json
```
