# 🚀 Deploy SkyRaven Ministries Now

Your app is **ready to deploy**! Follow these steps to get it live.

## ✅ Build Successful
Your production build completed successfully with no errors.

---

## 📦 Deploy Frontend to Vercel (5 minutes)

### Step 1: Go to Vercel
1. Visit [vercel.com](https://vercel.com)
2. Click **"Sign Up"** or **"Log In"** (use your GitHub account)

### Step 2: Import Project
1. Click **"Add New..."** → **"Project"**
2. Select **"Import Git Repository"**
3. Find and select: `skyravengreenfield-pixel/SkyRaven-Ministries`
4. Click **"Import"**

### Step 3: Configure Project
- **Framework Preset:** Vite
- **Root Directory:** `./` (leave as default)
- **Build Command:** `npm run build` (should auto-detect)
- **Output Directory:** `dist` (should auto-detect)

### Step 4: Add Environment Variables
Click **"Environment Variables"** and add these (copy from `.env.local`):

```
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51SmmyZLh2gszeHLKpa21KyU7iP59SXs1jM6Bok75nnSDbTSn0rQQ6zEhIXhuGPqBNRmqgv5JwQmYlZK8SZxRKQwC009SIff8b5

VITE_FIREBASE_API_KEY=AIzaSyARO1mi2SoNzraAVf6cRh7OhzqSREJhICw
VITE_FIREBASE_AUTH_DOMAIN=skyraven-ministries.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=skyraven-ministries
VITE_FIREBASE_STORAGE_BUCKET=skyraven-ministries.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=5544702060
VITE_FIREBASE_APP_ID=1:5544702060:web:3d610fb491f6267404a849
VITE_FIREBASE_MEASUREMENT_ID=G-RPSY0946W0

VITE_API_BASE_URL=https://us-central1-skyraven-ministries.cloudfunctions.net
VITE_API_TIMEOUT=30000
VITE_API_RETRY_ATTEMPTS=3
VITE_ENV=production
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_TRACKING=true
```

### Step 5: Deploy
1. Click **"Deploy"**
2. Wait 2-3 minutes for deployment
3. Your app will be live at: `https://sky-raven-ministries.vercel.app`

✅ **Done!** Your frontend is now live.

---

## 🔥 Deploy Firebase Functions (Required for Stripe)

Since you can't authenticate in the terminal, deploy from your **local computer**:

### On Your Local Machine:
```bash
# 1. Clone the repo (if not already)
git clone https://github.com/skyravengreenfield-pixel/SkyRaven-Ministries
cd SkyRaven-Ministries

# 2. Login to Firebase
firebase login

# 3. Set Stripe secret key
firebase functions:config:set stripe.secret_key="sk_live_YOUR_SECRET_KEY"

# 4. Deploy functions
firebase deploy --only functions
```

**Your Stripe Secret Key:** Check your Stripe Dashboard → Developers → API Keys

---

## 🎉 What Works Now

After deploying to Vercel:
- ✅ User authentication (sign up/login)
- ✅ Real-time Stripe balance display
- ✅ Beautiful UI with all features
- ✅ Firebase integration
- ⚠️ Stripe payments (needs Functions deployed)

After deploying Firebase Functions:
- ✅ Full payment processing
- ✅ Donation handling
- ✅ Subscription management

---

## 🔗 Your Live URLs

- **Frontend:** Will be at `https://[your-project].vercel.app`
- **API:** `https://us-central1-skyraven-ministries.cloudfunctions.net`

---

## 📝 Next Steps After Deployment

1. Test authentication (sign up/login)
2. Verify Stripe balance displays correctly
3. Deploy Firebase Functions from local machine
4. Test donations and payments
5. Share the URL with your team!

---

## ⚡ Update Production API URL

Once Firebase Functions are deployed, the API URL is already configured in the environment variables above:
```
VITE_API_BASE_URL=https://us-central1-skyraven-ministries.cloudfunctions.net
```

This will automatically work once you deploy the functions.

---

## 🆘 Need Help?

- Vercel deployment issues: [vercel.com/docs](https://vercel.com/docs)
- Firebase Functions: [firebase.google.com/docs/functions](https://firebase.google.com/docs/functions)
- Check build logs in Vercel dashboard for any errors

---

**Ready to go live? Start with Step 1 above! 🚀**
