# Deployment Guide - Frontend (Vercel) + Backend (Render)

## **STEP 1: DEPLOY BACKEND ON RENDER**

### 1.1 Create Render Account
- Go to **https://render.com**
- Sign up with GitHub account

### 1.2 Create New Web Service
- Click **"New +"** → **"Web Service"**
- Select your GitHub repo: `gaddamaditya/Auction`
- **Root Directory:** Leave EMPTY (don't set it)
- **Name:** `auction-backend`
- **Environment:** `Node`
- **Build Command:** `cd backend && npm install`
- **Start Command:** `cd backend && node src/server.js`

### 1.3 Add Environment Variables in Render
Click **"Environment"** and add:
```
PORT=5000
MONGO_URI=mongodb+srv://gaddamaditya8_db_user:Qfpe2epV2OsRAeof@cluster0.qjn8o0s.mongodb.net/auction_db?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=7k9L@mP#qR2wX5$vY8zB&nC3sD4aF6gH9jK0lM
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-vercel-frontend-url.vercel.app
NODE_ENV=production
```

⚠️ **IMPORTANT:** Replace `https://your-vercel-frontend-url.vercel.app` with your actual Vercel domain (you'll get this after deploying frontend)

### 1.4 Deploy
- Click **"Create Web Service"**
- Wait 3-5 minutes for deployment
- Note your backend URL: `https://auction-backend-xxxx.onrender.com`

---

## **STEP 2: DEPLOY FRONTEND ON VERCEL**

### 2.1 Create Vercel Account
- Go to **https://vercel.com**
- Sign up with GitHub account

### 2.2 Import Project
- Click **"Add New"** → **"Project"**
- Select `gaddamaditya/Auction` repository
- **Framework Preset:** React
- **Root Directory:** `Frontend` (capital F - case sensitive!)
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### 2.3 Add Environment Variables
Click **"Environment Variables"** tab and add:
```
VITE_API_URL=https://auction-backend-xxxx.onrender.com
```
(Replace with your actual Render backend URL from Step 1.4)

### 2.4 Deploy
- Click **"Deploy"**
- Wait for deployment (1-2 minutes)
- Your frontend will be live at: `https://your-project.vercel.app`

---

## **STEP 3: UPDATE BACKEND CORS**

After frontend is deployed:

1. Go back to **Render Dashboard**
2. Select `auction-backend` service
3. Click **"Environment"**
4. Update `CORS_ORIGIN` to your Vercel URL: `https://your-project.vercel.app`
5. Click **"Save Changes"** (service will restart)

---

## **STEP 4: TEST**

1. Open your Vercel frontend URL
2. Try to:
   - ✅ Register new user
   - ✅ Login
   - ✅ View auctions
   - ✅ Place a bid
   - ✅ Real-time updates work

---

## **TROUBLESHOOTING**

### "Network Error" on frontend
- Check `VITE_API_URL` in Vercel Environment Variables
- Verify Render backend is running (green dot on dashboard)
- Backend URL should be `https://auction-backend-xxxx.onrender.com` (not `http://`)

### CORS errors in browser console
- Verify `CORS_ORIGIN` in Render matches your Vercel domain exactly
- Clear browser cache (Ctrl+Shift+Delete)
- Verify `credentials: true` is set in both backend & frontend

### MongoDB connection failed
- Verify `MONGO_URI` is correct in Render Environment Variables
- Check IP whitelist on MongoDB Atlas (allow 0.0.0.0/0)
- Test connection: `mongodb+srv://gaddamaditya8_db_user:...`

### Socket.io not connecting
- Ensure `credentials: true` is set in:
  - `backend/src/server.js` (line 14)
  - `backend/src/app.js` (line 12)
  - `Frontend/src/lib/socket.js` (line 31)
- Check browser console for specific error message

### Build command failed on Render
- Make sure `Start Command` includes `cd backend`: `cd backend && node src/server.js`
- Build Command should be: `cd backend && npm install`

---

## **QUICK REFERENCE**

| Component | Platform | URL Pattern |
|-----------|----------|------------|
| Backend | Render | `https://auction-backend-xxxx.onrender.com` |
| Frontend | Vercel | `https://auction-app-xxxx.vercel.app` |
| Database | MongoDB Atlas | (in MONGO_URI env var) |
| GitHub | - | `https://github.com/gaddamaditya/Auction` |

---

## **AFTER DEPLOYMENT**

To update code after changes:
```bash
git add .
git commit -m "Your changes"
git push
```
Both Vercel and Render will auto-deploy on push to main branch.

---

## **IF YOU GET BUILD ERRORS ON RENDER**

The most common issue is the **Root Directory** setting. Make sure:
- ✅ Root Directory is **EMPTY** (not set to "backend")
- ✅ Build Command is: `cd backend && npm install`
- ✅ Start Command is: `cd backend && node src/server.js`

Then click "Manual Deploy" again.
