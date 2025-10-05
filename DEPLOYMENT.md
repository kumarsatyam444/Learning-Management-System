# Deployment Guide - MicroCourses LMS on Render

This guide walks you through deploying the MicroCourses LMS to Render.com.

## Prerequisites

- GitHub account
- Render.com account (free tier available)
- MongoDB Atlas account (already set up)
- Redis Cloud account (optional - Upstash/Redis Cloud free tier)

## Pre-Deployment Checklist

- [ ] Code is committed to GitHub
- [ ] MongoDB Atlas is configured and accessible
- [ ] Redis instance is available (optional)
- [ ] Environment variables are documented
- [ ] Backend seed script tested locally
- [ ] Frontend build tested locally

## Step 1: Prepare Your Repository

### 1.1 Create GitHub Repository

```bash
cd "Learning Management System"
git init
git add .
git commit -m "Initial commit - MicroCourses LMS"
git branch -M main
git remote add origin https://github.com/yourusername/microcourses-lms.git
git push -u origin main
```

### 1.2 Verify Repository Structure

Your repository should contain:
```
/
├── backend/
├── frontend/
├── README.md
├── QUICKSTART.md
├── TESTING.md
├── DEPLOYMENT.md
├── render.yaml
└── package.json
```

## Step 2: Setup Redis (Optional but Recommended)

### Option A: Upstash Redis (Free Tier)

1. Go to https://upstash.com
2. Create an account
3. Create a new Redis database
4. Copy the connection URL (starts with `redis://`)

### Option B: Redis Cloud (Free Tier)

1. Go to https://redis.com/try-free
2. Create an account
3. Create a new database
4. Copy the connection URL

### Option C: Skip Redis

If you skip Redis:
- Idempotency will be disabled
- Rate limiting will be disabled
- App will still work normally

## Step 3: Deploy Backend to Render

### 3.1 Create Web Service

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:

**Basic Settings:**
- Name: `microcourses-backend`
- Region: Choose closest to you
- Branch: `main`
- Root Directory: Leave empty
- Runtime: `Node`

**Build & Start Commands:**
```
Build Command: cd backend && npm install
Start Command: cd backend && npm start
```

**Environment Variables:**

Click "Add Environment Variable" for each:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | Generate: `openssl rand -hex 32` |
| `CERTIFICATE_SECRET` | Generate: `openssl rand -hex 32` |
| `REDIS_URL` | Your Redis URL (or leave empty) |
| `NODE_ENV` | `production` |
| `PORT` | `5000` |

**Instance Type:**
- Free tier is sufficient for testing

### 3.2 Deploy

1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Note your backend URL: `https://microcourses-backend.onrender.com`

### 3.3 Seed Database

After deployment, go to the "Shell" tab in Render dashboard and run:

```bash
cd backend && npm run seed
```

This creates test users and sample data.

### 3.4 Test Backend

```bash
curl https://microcourses-backend.onrender.com/health
```

Expected: `{"status":"ok","timestamp":"..."}`

Test API:
```bash
curl https://microcourses-backend.onrender.com/api/courses
```

## Step 4: Deploy Transcript Worker (Optional)

### 4.1 Create Background Worker

1. Click "New +" → "Background Worker"
2. Connect same repository
3. Configure:

**Basic Settings:**
- Name: `microcourses-worker`
- Runtime: `Node`

**Build & Start Commands:**
```
Build Command: cd backend && npm install
Start Command: cd backend && npm run worker
```

**Environment Variables:**
Use the same variables as the backend (copy from backend service)

### 4.2 Deploy

1. Click "Create Background Worker"
2. Wait for deployment

## Step 5: Deploy Frontend to Render

### 5.1 Create Static Site

1. Click "New +" → "Static Site"
2. Connect same repository
3. Configure:

**Basic Settings:**
- Name: `microcourses-frontend`
- Branch: `main`

**Build Settings:**
```
Build Command: cd frontend && npm install && npm run build
Publish Directory: frontend/build
```

**Environment Variables:**

| Key | Value |
|-----|-------|
| `REACT_APP_API_URL` | `https://microcourses-backend.onrender.com/api` |

Replace with your actual backend URL from Step 3.

### 5.2 Deploy

1. Click "Create Static Site"
2. Wait for deployment (5-10 minutes)
3. Your app will be at: `https://microcourses-frontend.onrender.com`

## Step 6: Post-Deployment Configuration

### 6.1 Test the Application

1. Visit your frontend URL
2. Try logging in with test accounts:
   - Admin: admin@example.com / Admin123!
   - Creator: creator@example.com / Creator123!
   - Learner: learner@example.com / Learner123!

### 6.2 Update CORS (if needed)

If you encounter CORS issues, update `backend/server.js`:

```javascript
app.use(cors({
  origin: 'https://microcourses-frontend.onrender.com',
  credentials: true
}));
```

Commit and push changes to trigger redeployment.

### 6.3 Configure Custom Domain (Optional)

In Render dashboard:
1. Go to your frontend service
2. Click "Settings" → "Custom Domain"
3. Follow instructions to add your domain

## Step 7: Alternative - Deploy with render.yaml

### 7.1 Use Blueprint

1. In Render dashboard, click "New +" → "Blueprint"
2. Connect repository
3. Select the `render.yaml` file
4. Update environment variables
5. Click "Apply"

This deploys all services at once!

## Monitoring & Maintenance

### Check Logs

In Render dashboard:
- Go to your service
- Click "Logs" tab
- Monitor for errors

### Set Up Alerts

1. Go to service settings
2. Configure notification emails
3. Set up health check alerts

### Performance Optimization

For production use:
1. Upgrade to paid tier for:
   - Always-on instances (no cold starts)
   - More resources
   - Better performance

2. Enable CDN for frontend
3. Add Redis for better caching
4. Configure database indexes

## Troubleshooting

### Backend Won't Start

- Check environment variables are set
- Verify MongoDB Atlas IP whitelist (allow from anywhere: 0.0.0.0/0)
- Check build logs for errors

### Frontend Can't Connect to Backend

- Verify `REACT_APP_API_URL` is correct
- Check CORS configuration
- Ensure backend is running

### Database Connection Fails

- Verify MongoDB Atlas connection string
- Check network access in MongoDB Atlas
- Ensure database user has correct permissions

### Redis Connection Issues

- Redis is optional - app works without it
- Verify Redis URL is correct
- Check Redis instance is running

## Security Checklist

- [ ] Change JWT_SECRET from default
- [ ] Change CERTIFICATE_SECRET from default
- [ ] MongoDB Atlas has IP whitelist configured
- [ ] Database user has minimal required permissions
- [ ] Environment variables are not in code
- [ ] HTTPS is enabled (automatic on Render)

## Scaling Considerations

As your app grows:

1. **Database:**
   - Upgrade MongoDB Atlas tier
   - Add indexes for queries
   - Enable database backups

2. **Backend:**
   - Upgrade Render instance
   - Add load balancing
   - Implement caching

3. **Frontend:**
   - Use CDN
   - Optimize images
   - Code splitting

## Cost Estimate

**Free Tier:**
- Render: 750 hours/month free
- MongoDB Atlas: 512MB free
- Redis Cloud: 30MB free
- Total: $0/month

**Paid Tier (Recommended for Production):**
- Render Web Service: ~$7/month
- Render Worker: ~$7/month
- Render Static Site: Free
- MongoDB Atlas M10: ~$57/month
- Redis Cloud: ~$5/month
- **Total: ~$76/month**

## Backup & Recovery

### Database Backups

1. MongoDB Atlas (M10+):
   - Automatic continuous backups
   - Point-in-time recovery

2. Manual Backups:
```bash
mongodump --uri="your-mongodb-uri"
```

### Code Backups

- GitHub is your backup
- Tag releases: `git tag v1.0.0`
- Create branches for stable versions

## Updating Your Deployment

### Automatic Deploys

Render auto-deploys on git push to main:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

### Manual Deploy

In Render dashboard:
1. Go to service
2. Click "Manual Deploy"
3. Select "Deploy latest commit"

## Environment-Specific Configs

### Staging Environment

Create separate services:
- `microcourses-backend-staging`
- `microcourses-frontend-staging`

Use different branch: `staging`

### Production Environment

- Use `main` branch
- Enable additional monitoring
- Set up automated backups

## Success Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Database seeded with test data
- [ ] Can register new users
- [ ] Can login with test accounts
- [ ] Learner flow works end-to-end
- [ ] Creator flow works end-to-end
- [ ] Admin flow works end-to-end
- [ ] Transcripts are generated
- [ ] Certificates are issued
- [ ] All role-based features work

## Support & Resources

- **Render Docs:** https://render.com/docs
- **MongoDB Atlas:** https://docs.atlas.mongodb.com
- **Redis Cloud:** https://docs.redis.com/latest/rc/

---

**Your MicroCourses LMS is now live!** 🚀

Share your URL: `https://microcourses-frontend.onrender.com`
