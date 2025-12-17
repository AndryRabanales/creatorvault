# CreatorVault Deployment Checklist

Use this checklist to ensure a successful deployment.

---

## 📋 Pre-Deployment Checklist

### 1. Code & Repository

- [ ] All code changes are committed to Git
- [ ] Code is pushed to GitHub
- [ ] No sensitive data (secrets, keys) in code
- [ ] `.gitignore` is properly configured
- [ ] Dependencies are up to date (`pnpm install`)

### 2. Environment Variables

Run the validation script:
```bash
pnpm validate
```

**Required Variables:**
- [ ] `DATABASE_URL` - Database connection string
- [ ] `JWT_SECRET` - At least 64 characters
- [ ] `STRIPE_SECRET_KEY` - Stripe backend key
- [ ] `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe frontend key

**Auth Provider (at least one):**
- [ ] Auth0: `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`
- [ ] OR Clerk: `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`
- [ ] OR Manus: `VITE_APP_ID`, `OAUTH_SERVER_URL` (dev only)

**Optional but Recommended:**
- [ ] `FRONTEND_URL` - Your frontend domain
- [ ] `BACKEND_URL` - Your backend domain
- [ ] `NODE_ENV=production`

### 3. Database Setup

Test your database connection:
```bash
pnpm db:test
```

- [ ] Database is created (Neon/PlanetScale/Railway)
- [ ] Connection string is correct
- [ ] SSL is enabled for production
- [ ] Database schema is migrated: `pnpm db:push`
- [ ] Can connect to database successfully

### 4. Stripe Configuration

- [ ] Stripe account created and verified
- [ ] API keys copied (test or live)
- [ ] Webhook endpoint created: `https://your-backend.com/api/stripe/webhook`
- [ ] Webhook events configured:
  - [ ] `payment_intent.succeeded`
  - [ ] `payment_intent.payment_failed`
  - [ ] `checkout.session.completed`
  - [ ] `checkout.session.expired`
- [ ] Webhook secret copied
- [ ] Test payment works (use test card: 4242 4242 4242 4242)

### 5. Authentication Setup

**If using Auth0:**
- [ ] Auth0 application created
- [ ] Allowed Callback URLs set: `https://your-domain.com/api/oauth/callback`
- [ ] Allowed Logout URLs set: `https://your-domain.com`
- [ ] Allowed Web Origins set: `https://your-domain.com`
- [ ] API keys copied to environment

**If using Clerk:**
- [ ] Clerk application created
- [ ] API keys copied to environment
- [ ] Frontend integration configured

### 6. Build & Test Locally

- [ ] Project builds successfully: `pnpm build`
- [ ] No TypeScript errors: `pnpm check`
- [ ] Tests pass: `pnpm test`
- [ ] Can start in production mode: `pnpm start`
- [ ] Health endpoint responds: `curl http://localhost:3000/api/health`

---

## 🚀 Deployment Steps

### Backend Deployment (Railway)

1. **Create Railway Project**
   - [ ] Sign up at https://railway.app
   - [ ] Create new project
   - [ ] Deploy from GitHub repo

2. **Configure Environment Variables**
   - [ ] Add all backend environment variables
   - [ ] Use Railway's "Paste .env" feature for bulk import
   - [ ] Verify all variables are set correctly

3. **Deploy & Verify**
   - [ ] Deployment completes successfully
   - [ ] Check build logs for errors
   - [ ] Test health endpoint: `https://your-app.railway.app/api/health`
   - [ ] Verify response shows correct configuration

4. **Configure Domain (Optional)**
   - [ ] Add custom domain in Railway settings
   - [ ] Update DNS records
   - [ ] Wait for SSL certificate

### Frontend Deployment (Vercel)

1. **Import Project**
   - [ ] Sign up at https://vercel.com
   - [ ] Import from GitHub
   - [ ] Framework: Vite
   - [ ] Build Command: `pnpm build`
   - [ ] Output Directory: `dist/public`

2. **Configure Environment Variables**
   - [ ] `VITE_API_URL` - Your Railway backend URL
   - [ ] `VITE_STRIPE_PUBLISHABLE_KEY`
   - [ ] Auth variables (if needed)
   - [ ] All `VITE_` prefixed variables

3. **Deploy & Verify**
   - [ ] Deployment completes successfully
   - [ ] Visit deployed URL
   - [ ] Site loads correctly
   - [ ] Can navigate pages
   - [ ] No console errors

4. **Configure Domain (Optional)**
   - [ ] Add custom domain in Vercel
   - [ ] Update DNS records
   - [ ] SSL configures automatically

---

## ✅ Post-Deployment Verification

### 1. Health Checks

Test all critical endpoints:

```bash
# Health check
curl https://your-backend.railway.app/api/health

# Should return:
# {"status":"ok","timestamp":...,"database":"configured","stripe":"configured","auth":"auth0"}
```

### 2. Authentication Flow

- [ ] Visit frontend homepage
- [ ] Click "Get Started" or "Login"
- [ ] Redirected to auth provider
- [ ] Can complete authentication
- [ ] Redirected back to app
- [ ] Logged in successfully
- [ ] Session persists on page refresh

### 3. Role Selection & Onboarding

- [ ] Can select Creator or Brand role
- [ ] Creator onboarding form works
- [ ] Brand onboarding form works
- [ ] Profile data saves correctly
- [ ] Redirected to appropriate dashboard

### 4. Creator Flow

- [ ] Creator dashboard loads
- [ ] Tier is displayed correctly
- [ ] Can view marketplace
- [ ] Can apply to campaigns
- [ ] Can view applications
- [ ] Can submit deliverables

### 5. Brand Flow

- [ ] Brand dashboard loads
- [ ] Can create new campaign
- [ ] Campaign form validation works
- [ ] Can initiate Stripe checkout
- [ ] Stripe payment processes
- [ ] Campaign status updates after payment
- [ ] Can view applications
- [ ] Can approve/reject creators

### 6. Stripe Integration

- [ ] Checkout session creates successfully
- [ ] Test payment completes (test card: 4242 4242 4242 4242)
- [ ] Webhook receives events
- [ ] Payment status updates in database
- [ ] Check Railway logs for webhook confirmations

### 7. Database Operations

- [ ] Data persists correctly
- [ ] Queries are fast (<1s)
- [ ] No connection errors in logs
- [ ] Can create, read, update records

### 8. CORS & API

- [ ] Frontend can call backend APIs
- [ ] No CORS errors in browser console
- [ ] Cookies are set correctly
- [ ] Authentication headers work

---

## 🔍 Monitoring & Logs

### Railway (Backend)

- [ ] View deployment logs: Dashboard → Deployments → View Logs
- [ ] Check for startup errors
- [ ] Verify database connection logs
- [ ] Monitor webhook events
- [ ] Check memory/CPU usage

### Vercel (Frontend)

- [ ] View deployment logs: Deployments → Functions
- [ ] Check for build warnings
- [ ] Monitor function invocations
- [ ] Review real-time logs

### Stripe

- [ ] Monitor webhook deliveries: Developers → Webhooks
- [ ] Check for failed events
- [ ] Review recent payments: Payments
- [ ] Verify no disputes or issues

---

## 🛠️ Troubleshooting

If something goes wrong, check:

1. **Environment Variables**: Run `pnpm validate`
2. **Database Connection**: Run `pnpm db:test`
3. **Build Logs**: Check Railway/Vercel deployment logs
4. **Browser Console**: Check for JavaScript errors
5. **Network Tab**: Check for failed API requests
6. **Health Endpoint**: Verify `/api/health` returns correct status

See [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md#-solución-de-problemas-comunes) for common issues and solutions.

---

## 🎉 Success!

If all items are checked, your deployment is complete!

### Next Steps

1. **Test with real users**: Get feedback
2. **Monitor performance**: Check logs regularly
3. **Setup alerts**: Configure error notifications
4. **Plan scaling**: Monitor usage and upgrade when needed
5. **Backup data**: Configure database backups

### Production Best Practices

- 🔐 Rotate secrets every 90 days
- 📊 Monitor error rates and performance
- 💾 Enable database backups
- 🔄 Keep dependencies updated
- 📝 Document any custom configurations
- 🚨 Setup error tracking (e.g., Sentry)
- 📈 Configure analytics
- 🔒 Review security settings regularly

---

## 📞 Support

If you need help:

- 📖 Check the documentation in `/docs`
- 🐛 Search for similar issues on GitHub
- 💬 Contact support
- 🔍 Review the troubleshooting guide

**Happy Deploying! 🚀**
