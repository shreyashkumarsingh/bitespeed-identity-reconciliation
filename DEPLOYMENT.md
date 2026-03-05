# Deployment Guide

This guide walks you through deploying the Bitespeed Identity Reconciliation API to the internet.

## Prerequisites

- GitHub account (https://github.com)
- Render.com account (https://render.com)
- Neon or ElephantSQL account for free PostgreSQL

## Step 1: Push Code to GitHub

### 1a. Create a GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right → **"New repository"**
3. Fill in the details:
   - **Repository name:** `bitespeed-identity-reconciliation`
   - **Description:** Bitespeed Backend Task: Identity Reconciliation
   - **Visibility:** Public (required for submission)
   - **Initialize with:** Skip this (we already have commits)
4. Click **"Create repository"**

### 1b. Push Your Code

After creating the repo, you'll see instructions. Run these commands in your project directory:

```powershell
cd c:\Users\KIIT0001\Desktop\project

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/bitespeed-identity-reconciliation.git

# Rename branch to main
git branch -M main

# Push code to GitHub
git push -u origin main
```

**Expected output:**
```
Enumerating objects: 14, done.
Counting objects: 100% (14/14), done.
...
* [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

✅ Your code is now on GitHub!

---

## Step 2: Create Free PostgreSQL Database

### Option A: Using Neon (Recommended)

1. Go to [https://neon.tech](https://neon.tech)
2. Click **"Sign Up"** and create an account
3. Create a new project
4. Click on your project and find the **"Connection string"** tab
5. Copy the connection string that looks like:
   ```
   postgresql://user:password@neon.tech/dbname
   ```
6. **Save this somewhere safe** - you'll need it for Render

### Option B: Using ElephantSQL

1. Go to [https://www.elephantsql.com](https://www.elephantsql.com)
2. Click **"Get Started"** for free tier
3. Create an account and log in
4. Click **"Create New Instance"**
5. Choose free tier and create
6. Copy the **PostgreSQL URL** from the dashboard
7. **Save this somewhere safe** - you'll need it for Render

---

## Step 3: Deploy to Render.com

### 3a. Create Render Account

1. Go to [https://render.com](https://render.com)
2. Click **"Get Started"** and sign in with GitHub (easier option)
3. Authorize Render to access your GitHub account

### 3b. Create Web Service

1. In your Render dashboard, click **"New +"** → **"Web Service"**
2. Select **"Deploy an existing Git repository"**
3. Search for and select `bitespeed-identity-reconciliation`
4. Click **"Connect"**

### 3c. Configure Service

Fill in the configuration:

| Field | Value |
|-------|-------|
| Name | `bitespeed-api` |
| Environment | `Node` |
| Region | `Oregon` (or closest to you) |
| Branch | `main` |
| Build Command | `npm install && npm run build` |
| Start Command | `npm start` |
| Plan | `Free` |

### 3d. Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add these variables:

1. **First variable:**
   - Key: `DATABASE_URL`
   - Value: Paste your Neon/ElephantSQL connection string here

2. **Second variable:**
   - Key: `NODE_ENV`
   - Value: `production`

3. **Third variable:**
   - Key: `PORT`
   - Value: `3000`

### 3e. Deploy

1. Click **"Create Web Service"**
2. Wait for the build to complete (takes 2-5 minutes)
3. You'll see a URL like: `https://bitespeed-api.onrender.com`
4. **Save this URL** - this is your live API endpoint!

### 3f. Run Database Migration

Once deployed:

1. Go to your Render dashboard
2. Click on your service
3. Click **"Shell"** tab
4. Run migration command:
   ```bash
   npm run migrate
   ```

You should see:
```
Migration completed successfully
```

---

## Step 4: Test Your Live API

Use curl, Postman, or any HTTP client to test:

```bash
curl -X POST https://bitespeed-api.onrender.com/identify \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "phoneNumber": "1234567890"}'
```

Expected response:
```json
{
  "contact": {
    "primaryContatctId": 1,
    "emails": ["test@example.com"],
    "phoneNumbers": ["1234567890"],
    "secondaryContactIds": []
  }
}
```

---

## Step 5: Update README

Update [README.md](README.md) with your live endpoint:

Find this section:
```markdown
## Live Endpoint

**Base URL**: [To be updated after deployment]
```

Replace with:
```markdown
## Live Endpoint

**Base URL**: https://bitespeed-api.onrender.com

**Example Request:**
```bash
POST https://bitespeed-api.onrender.com/identify
Content-Type: application/json

{
  "email": "user@example.com",
  "phoneNumber": "1234567890"
}
```

**Example Response:**
```json
{
  "contact": {
    "primaryContatctId": 1,
    "emails": ["user@example.com"],
    "phoneNumbers": ["1234567890"],
    "secondaryContactIds": []
  }
}
```
```

Then commit and push:

```powershell
cd c:\Users\KIIT0001\Desktop\project
git add README.md
git commit -m "Update README with live API endpoint"
git push
```

---

## Step 6: Submit Task

Go to the [BiteSpeed Submission Form](https://forms.gle/hsQBJQ8tzbsp53D77)

Fill in:
- **GitHub Repository URL:** https://github.com/YOUR_USERNAME/bitespeed-identity-reconciliation
- **Live API Endpoint:** https://bitespeed-api.onrender.com/identify
- **Any additional notes:** (optional)

Click **"Submit"**

---

## Troubleshooting

### API returns 500 error
- Check Render logs: Click on your service → "Logs" tab
- Verify DATABASE_URL is correct in environment variables
- Run migration again in Shell tab

### "Migration completed successfully" but requests fail
- Make sure you ran `npm run migrate` in the Render Shell
- Check the connection string is correct

### Render deployment fails
- Check build logs for errors
- Verify package.json and tsconfig.json are correct
- Run `npm install && npm run build` locally to test

### "Cannot connect to database"
- Verify DATABASE_URL format is correct
- Check that Neon/ElephantSQL service is active
- In Neon/ElephantSQL dashboard, you should see your connection established

---

## Monitoring Your API

### View Logs
- In Render dashboard, click your service
- Click **"Logs"** tab to see real-time logs

### View Metrics
- In Render dashboard, your service shows uptime and performance

### Keep API Awake
- Free tier Render services go to sleep after 15 minutes of inactivity
- First request after sleep may take 30 seconds
- This is normal for free tier

---

## Next Steps

- Monitor API usage in Render dashboard
- Test thoroughly before submitting
- Consider upgrading to paid plan if you need guaranteed uptime
- Share your API endpoint with others for testing

Good luck! 🚀
