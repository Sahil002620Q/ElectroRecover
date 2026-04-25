# 🚀 Deployment Guide: ElectroRecover

Follow these steps to deploy your application to **Render** (Backend) and **Vercel** (Frontend).

---

## 1. Backend Deployment (Render)

### Step 1: Create a PostgreSQL Database
1. Log in to [Render](https://dashboard.render.com/).
2. Click **New +** > **PostgreSQL**.
3. **Name**: `electro-recover-db`
4. **Plan**: Free
5. Click **Create Database**.
6. Once created, copy the **Internal Database URL** (for Render services) or **External Database URL** (to view locally).

### Step 2: Create the Web Service
1. Click **New +** > **Web Service**.
2. Connect your GitHub repository.
3. **Name**: `electro-recover-api`
4. **Environment**: `Python 3`
5. **Root Directory**: `backend` (Important: Point to the backend folder)
6. **Build Command**: `pip install -r requirements.txt`
7. **Start Command**: `uvicorn main:app --host 0.0.0.0 --port 10000`

### Step 3: Set Environment Variables
Click **Environment** and add:
- `DATABASE_URL`: (Paste your Internal PostgreSQL URL here)
- `SECRET_KEY`: `your-random-secret-key-here`
- `ALGORITHM`: `HS256`
- `ACCESS_TOKEN_EXPIRE_MINUTES`: `60`

---

## 2. Frontend Deployment (Vercel)

### Step 1: Update your Backend URL
Before deploying, open `frontend/app.js` and update line 7:
```javascript
: 'https://electro-recover-api.onrender.com'; // Replace with your Render URL
```

### Step 2: Deploy to Vercel
1. Log in to [Vercel](https://vercel.com/).
2. Click **Add New** > **Project**.
3. Connect your GitHub repository.
4. **Framework Preset**: `Other`
5. **Root Directory**: `frontend`
6. Click **Deploy**.

---

## 📝 Values to Fill (Quick Reference)

### Render (Web Service Options)
| Field | Value |
| :--- | :--- |
| **Name** | `electro-recover-api` |
| **Region** | (Choose closest to you) |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn main:app --host 0.0.0.0 --port 10000` |

### Vercel (Project Options)
| Field | Value |
| :--- | :--- |
| **Project Name** | `electro-recover-frontend` |
| **Framework Preset** | `Other` |
| **Root Directory** | `frontend` |
| **Build Command** | (Leave empty) |
| **Output Directory** | (Leave empty - it will serve index.html) |

---

## ✅ Post-Deployment Check
1. Open your Vercel URL.
2. Try to Register/Login.
3. If it fails, check the **Render Logs** for database connection errors and the **Browser Console** for CORS issues.
