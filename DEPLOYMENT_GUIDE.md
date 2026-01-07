# 🚀 Complete Deployment Guide

This guide covers deploying both the frontend and backend of your SkyRaven Ministries application.

## 📋 Pre-Deployment Checklist

- [ ] Firebase project configured with production credentials
- [ ] Stripe live API keys ready
- [ ] Domain name purchased (optional but recommended)
- [ ] Git repository up to date
- [ ] All environment variables documented

---

## 🎨 Frontend Deployment

The frontend is a static Vite/React app that can be deployed to various platforms.

### Option 1: Vercel (Recommended - Easiest)

**Why Vercel?**
- Zero configuration for Vite apps
- Automatic HTTPS
- Global CDN
- Free SSL certificates
- Preview deployments for PRs

**Steps:**

1. **Install Vercel CLI** (optional):
   ```bash
   npm install -g vercel
   ```

2. **Deploy via Vercel Dashboard** (easier):
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel auto-detects Vite configuration
   - Add environment variables:
     ```
     VITE_API_BASE_URL=https://your-backend-url.com/api
     VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
     VITE_FIREBASE_API_KEY=...
     VITE_FIREBASE_AUTH_DOMAIN=...
     VITE_FIREBASE_PROJECT_ID=...
     VITE_FIREBASE_STORAGE_BUCKET=...
     VITE_FIREBASE_MESSAGING_SENDER_ID=...
     VITE_FIREBASE_APP_ID=...
     VITE_FIREBASE_MEASUREMENT_ID=...
     ```
   - Click "Deploy"

3. **Deploy via CLI**:
   ```bash
   cd /workspaces/SkyRaven-Ministries
   vercel
   ```
   Follow the prompts and add environment variables when asked.

4. **Configure Custom Domain** (optional):
   - In Vercel dashboard, go to Project Settings > Domains
   - Add your custom domain
   - Update DNS records as instructed

**Your frontend is now live!** 🎉

---

### Option 2: Netlify

**Steps:**

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Build the app**:
   ```bash
   npm run build
   ```

3. **Deploy**:
   ```bash
   netlify deploy --prod
   ```
   - Choose "Create new site"
   - Set publish directory to `dist`

4. **Or use Netlify Dashboard**:
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop your `dist` folder
   - Add environment variables in Site Settings > Environment

---

### Option 3: GitHub Pages

**Steps:**

1. **Update `vite.config.ts`**:
   ```typescript
   export default defineConfig({
     base: '/SkyRaven-Ministries/',  // Your repo name
     // ... rest of config
   });
   ```

2. **Build**:
   ```bash
   npm run build
   ```

3. **Deploy with GitHub Actions** (workflow already exists in `.github/workflows/ci-cd.yml`)

4. **Enable GitHub Pages**:
   - Go to repository Settings > Pages
   - Set source to "GitHub Actions"

5. **Push to main branch** - auto-deploys!

---

## 🔧 Backend Deployment

The backend is an Express.js server that needs a Node.js hosting platform.

### Option 1: Railway (Recommended - Easy & Free Tier)

**Why Railway?**
- Simple deployment
- Free $5/month credit
- Automatic HTTPS
- Easy environment variables
- PostgreSQL support if needed later

**Steps:**

1. **Go to [railway.app](https://railway.app)**
2. Click "Start a New Project"
3. Choose "Deploy from GitHub repo"
4. Select your repository
5. Choose the `server` directory as root
6. Add environment variables:
   ```
   PORT=3000
   NODE_ENV=production
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```
7. Deploy!

**Get your backend URL**: `https://your-app.railway.app`

---

### Option 2: Render

**Steps:**

1. **Go to [render.com](https://render.com)**
2. Click "New +" > "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
5. Add environment variables (same as Railway)
6. Click "Create Web Service"

**Free tier available!**

---

### Option 3: Docker Deployment (Any Platform)

For platforms like DigitalOcean, AWS, Google Cloud, or Azure:

1. **Build Docker image**:
   ```bash
   cd server
   docker build -t skyraven-api .
   ```

2. **Test locally**:
   ```bash
   docker run -p 3000:3000 --env-file .env skyraven-api
   ```

3. **Push to container registry**:
   ```bash
   # Docker Hub
   docker tag skyraven-api yourusername/skyraven-api
   docker push yourusername/skyraven-api
   
   # Or use platform-specific registry (AWS ECR, Google Container Registry, etc.)
   ```

4. **Deploy to your platform** following their documentation

---

### Option 4: VPS (DigitalOcean, Linode, etc.)

**Steps:**

1. **SSH into your server**:
   ```bash
   ssh root@your-server-ip
   ```

2. **Install Node.js**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Clone repository**:
   ```bash
   git clone https://github.com/skyravengreenfield-pixel/SkyRaven-Ministries.git
   cd SkyRaven-Ministries/server
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Create `.env` file** with production values

6. **Install PM2** (process manager):
   ```bash
   npm install -g pm2
   pm2 start index.js --name skyraven-api
   pm2 startup
   pm2 save
   ```

7. **Set up Nginx reverse proxy**:
   ```bash
   sudo apt install nginx
   sudo nano /etc/nginx/sites-available/skyraven
   ```
   
   Add:
   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

8. **Enable site and restart Nginx**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/skyraven /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

9. **Set up SSL with Let's Encrypt**:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d api.yourdomain.com
   ```

---

## 🔗 Connect Frontend to Backend

After deploying both:

1. **Update Frontend Environment Variables**:
   - Go to Vercel/Netlify dashboard
   - Update `VITE_API_BASE_URL` to your backend URL
   - Example: `https://skyraven-api.railway.app/api`
   - Redeploy frontend

2. **Update Backend CORS**:
   - In `server/.env`, update:
     ```
     FRONTEND_URL=https://your-frontend.vercel.app
     ```
   - Redeploy backend

3. **Test Connection**:
   ```bash
   curl https://your-backend-url.com/api/health
   ```

---

## 🎯 Stripe Webhook Configuration

**Important:** Update your Stripe webhooks for production!

1. **Go to Stripe Dashboard** > Developers > Webhooks
2. **Add endpoint**: `https://your-backend-url.com/api/webhooks/stripe`
3. **Select events**:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. **Copy webhook signing secret**
5. **Add to backend env variables**:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
6. **Redeploy backend**

---

## 🔥 Firebase Security Rules

Deploy Firebase security rules for production:

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Initialize Firebase**:
   ```bash
   firebase init
   ```
   - Select Firestore and Storage
   - Choose your existing project

3. **Create `firestore.rules`**:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       
       match /projects/{projectId} {
         allow read: if true;
         allow write: if request.auth != null && 
                      request.auth.token.role == 'admin';
       }
       
       match /donations/{donationId} {
         allow read: if request.auth != null;
         allow write: if request.auth != null;
       }
       
       match /expenses/{expenseId} {
         allow read: if request.auth != null;
         allow write: if request.auth != null && 
                      request.auth.token.role == 'admin';
       }
     }
   }
   ```

4. **Create `storage.rules`**:
   ```
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /documents/{fileName} {
         allow read: if request.auth != null;
         allow write: if request.auth != null && 
                       request.auth.token.role == 'admin';
       }
       
       match /receipts/{fileName} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

5. **Deploy rules**:
   ```bash
   firebase deploy --only firestore:rules
   firebase deploy --only storage:rules
   ```

---

## ✅ Post-Deployment Checklist

- [ ] Frontend is live and accessible
- [ ] Backend is live and health check passes
- [ ] Frontend can communicate with backend
- [ ] Stripe payments work in production
- [ ] Firebase authentication works
- [ ] Firebase security rules deployed
- [ ] Stripe webhooks configured and working
- [ ] SSL certificates active (HTTPS)
- [ ] Custom domain configured (if applicable)
- [ ] Environment variables secured (not in code)
- [ ] Error monitoring active (Sentry)
- [ ] Analytics working (Firebase Analytics)
- [ ] Test donation flow end-to-end
- [ ] Mobile responsive on real devices

---

## 🧪 Testing Production Deployment

1. **Test Stripe Payment**:
   - Go to your live site
   - Make a test donation
   - Check Stripe Dashboard for transaction

2. **Test Firebase Auth**:
   - Sign up new account
   - Sign in
   - Check Firebase Console

3. **Test API Connection**:
   ```bash
   curl https://your-backend-url.com/api/health
   ```

4. **Check Error Tracking**:
   - Trigger an intentional error
   - Check Sentry dashboard

---

## 📊 Monitoring & Maintenance

### Set Up Monitoring

1. **Vercel Analytics**: Automatically enabled
2. **Railway Metrics**: Available in dashboard
3. **Firebase Performance**: Already configured
4. **Stripe Dashboard**: Monitor transactions

### Regular Maintenance

- Monitor Firebase usage quotas
- Check Stripe transaction logs
- Review error logs in Sentry
- Update dependencies monthly:
  ```bash
  npm outdated
  npm update
  ```

---

## 🆘 Troubleshooting

**Frontend not loading:**
- Check browser console for errors
- Verify environment variables in hosting dashboard
- Check build logs

**Backend API errors:**
- Check backend logs in hosting dashboard
- Verify environment variables
- Test API endpoint directly with curl

**Stripe payments failing:**
- Check Stripe Dashboard logs
- Verify webhook secret is correct
- Check backend logs for errors

**Firebase errors:**
- Check Firebase Console for quota limits
- Verify security rules aren't blocking requests
- Check authentication configuration

---

## 🎉 You're Live!

Your SkyRaven Ministries application is now deployed and ready to accept real donations!

**Next Steps:**
1. Share your URL with stakeholders
2. Test thoroughly with small donations
3. Monitor for any issues
4. Collect feedback
5. Iterate and improve

**Support Links:**
- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Stripe Docs](https://stripe.com/docs)
- [Firebase Docs](https://firebase.google.com/docs)

---

**🚀 Your ministry impact platform is now live and ready to make a difference!**
