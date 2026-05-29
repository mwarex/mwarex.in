# Keep-Alive Setup for Render Backend

## Problem
Render's free tier puts your backend to sleep after 15 minutes of inactivity. When a user tries to sign in with Google, they see Render's ugly "waking up" screen.

## Solution
We've implemented TWO solutions to keep your backend awake:

---

## 1. Vercel Cron Job (Primary - Automatic)

A cron job is configured in `vercel.json` that pings your backend every 14 minutes.

### How it works:
- Vercel calls `/api/keep-alive` every 14 minutes
- This endpoint pings your Render backend at `/api/v1/health`
- Backend stays awake, users never see cold start screens!

### Files:
- `vercel.json` - Cron configuration
- `src/app/api/keep-alive/route.ts` - Keep-alive API route

### To Enable:
1. Just deploy to Vercel - the cron will start automatically
2. Check Vercel Dashboard → Your Project → Settings → Crons to verify

### Vercel Cron Limits (Free Tier):
- 2 cron jobs
- Vercel's Hobby free tier limits crons to **at most 2 runs per day**! It does not support a high-frequency interval (like every 14 minutes) on the free plan, which is why it spins down. If you need it for free, use Option 2 or Option 3 below!

---

## 2. GitHub Actions Cron Job (NEW - Recommended & 100% Free)

We have created an automated GitHub Actions workflow in `.github/workflows/keep-alive.yml`. This runs on GitHub's secure servers in the cloud completely for free!

### How it works:
- GitHub runs the workflow automatically **every 10 minutes** (`*/10 * * * *`).
- It triggers a `curl` ping request directly to your Node.js backend health check endpoint.
- Since it runs every 10 minutes, your Render container never has 15 minutes of inactivity and **stays awake 24/7**!

### Actions Setup:
1. Push this code to your GitHub repository (`git push`).
2. Go to your GitHub Repository → **Actions** tab to verify that the `Keep MwareX Render Backend Awake` workflow is active!

---

## 3. External Cron Service (Backup - Free)

If Vercel's cron doesn't run frequently enough and you want a secondary backup to GitHub Actions, you can use these free services:

### Option A: cron-job.org
1. Go to https://cron-job.org
2. Create a free account
3. Create a new cron job:
   - **URL**: `https://mwarex-backend.onrender.com/api/v1/health`
   - **Schedule**: Every 10 minutes (Custom: `*/10 * * * *`)
   - **Request Method**: GET
4. Enable the job

### Option B: UptimeRobot
1. Go to https://uptimerobot.com
2. Create a free account
3. Add a new monitor:
   - **Monitor Type**: HTTP(s)
   - **URL**: `https://mwarex-backend.onrender.com/api/v1/health`
   - **Monitoring Interval**: 5 minutes (minimum on free tier)
4. This will ping your server every 5 minutes

---

## 4. Frontend Loading Modal (Fallback)

Even if the server does go to sleep, users will see a beautiful branded loading screen instead of Render's ugly one.

---

## Testing

### Test if backend is awake:
```bash
curl https://mwarex-backend.onrender.com/api/v1/health
```

### Test keep-alive endpoint (after deployment):
```bash
curl https://mwarex.in/api/keep-alive
```

---

## Summary

| Method | Frequency | Free? | Auto? | Status |
|--------|-----------|-------|-------|--------|
| GitHub Actions | Every 10 min | Yes | Yes | **Primary & Recommended** |
| Vercel Cron | 2x per day (Hobby) | Yes | Yes | Throttled on Free plan |
| cron-job.org | Every 10 min | Yes | Yes | Great backup |
| UptimeRobot | Every 5 min | Yes | Yes | Great backup |

With these in place, your users will **never** see the Render cold start screen! 🎉
