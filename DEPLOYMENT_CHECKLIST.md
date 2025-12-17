# CreatorVault Deployment Checklist

Use this checklist before deploying to production to ensure everything is properly configured.

## Pre-Deployment Checklist

### 1. Environment Variables

#### Required Variables
- [ ] `DATABASE_URL` - Database connection string configured
- [ ] `JWT_SECRET` - At least 32 characters, unique for production
- [ ] At least one auth provider configured:
  - [ ] Auth0 (recommended): `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`
  - [ ] Clerk: `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`

#### Recommended Variables (for full functionality)
- [ ] `STRIPE_SECRET_KEY` - For payment processing
- [ ] `STRIPE_WEBHOOK_SECRET` - For payment webhooks
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY` - Frontend Stripe key
- [ ] `FRONTEND_URL` - Your frontend domain (e.g., https://app.example.com)
- [ ] `BACKEND_URL` - Your backend domain (e.g., https://api.example.com)
- [ ] `NODE_ENV=production` - Set environment to production

#### Optional Variables
- [ ] `PORT` - Server port (default: 3000)
- [ ] AWS S3 for file uploads: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET`
- [ ] Email service: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`

### 2. Database Setup

- [ ] Database created and accessible
- [ ] SSL enabled for production databases
- [ ] Database migrations run: `pnpm db:push`
- [ ] Database connection tested: `pnpm db:test`
- [ ] Backup strategy configured

### 3. Authentication Provider

Choose and configure one:

#### If using Auth0:
- [ ] Auth0 application created
- [ ] Callback URL configured: `https://your-backend-url.com/api/oauth/callback`
- [ ] Logout URL configured: `https://your-frontend-url.com`
- [ ] Domain, Client ID, and Client Secret added to environment

#### If using Clerk:
- [ ] Clerk application created
- [ ] API keys copied to environment variables
- [ ] Domain configured in Clerk dashboard

### 4. Stripe Configuration (if using payments)

- [ ] Stripe account created and verified
- [ ] API keys obtained (use live keys for production!)
- [ ] Webhook endpoint created: `https://your-backend-url.com/api/stripe/webhook`
- [ ] Webhook events configured:
  - [ ] `payment_intent.succeeded`
  - [ ] `payment_intent.payment_failed`
  - [ ] `checkout.session.completed`
- [ ] Webhook secret added to environment
- [ ] Test payment completed successfully

### 5. Build and Deploy

#### Backend (Railway/Render/etc.)
- [ ] Code pushed to GitHub
- [ ] Connected to hosting platform
- [ ] Environment variables configured
- [ ] Build command: `pnpm build`
- [ ] Start command: `pnpm start`
- [ ] Health check passes: `pnpm health` or check `/api/health`
- [ ] Logs reviewed for errors

#### Frontend (Vercel/Netlify/etc.)
- [ ] Code pushed to GitHub
- [ ] Connected to hosting platform
- [ ] Environment variables configured (all `VITE_*` variables)
- [ ] Build command: `pnpm build`
- [ ] Output directory: `dist`
- [ ] Deployment successful
- [ ] Site loads correctly

### 6. Domain and SSL

- [ ] Custom domain purchased (optional)
- [ ] DNS configured correctly
- [ ] SSL certificate active (HTTPS)
- [ ] Frontend URL accessible
- [ ] Backend API accessible
- [ ] No mixed content warnings (all HTTPS)

### 7. CORS Configuration

- [ ] `FRONTEND_URL` matches actual frontend domain
- [ ] No CORS errors in browser console
- [ ] API calls from frontend work correctly

### 8. Testing

#### Authentication Flow
- [ ] Login works
- [ ] Logout works
- [ ] Session persists on refresh
- [ ] Redirects work correctly
- [ ] Protected routes require login

#### Creator Flow
- [ ] Creator can register and onboard
- [ ] Creator dashboard loads
- [ ] Creator can browse campaigns
- [ ] Creator can apply to campaigns
- [ ] Creator receives notifications

#### Brand Flow
- [ ] Brand can register and onboard
- [ ] Brand dashboard loads
- [ ] Brand can create campaigns
- [ ] Brand can review applications
- [ ] Brand can approve creators
- [ ] Contracts generate correctly

#### Payment Flow (if Stripe enabled)
- [ ] Test payment completes
- [ ] Webhook receives events
- [ ] Payment status updates
- [ ] Creator receives payout notification

#### General Features
- [ ] Messaging works
- [ ] Notifications appear
- [ ] Reviews can be submitted
- [ ] Analytics display correctly
- [ ] All navigation links work

### 9. Performance and Security

- [ ] Build size optimized (< 1MB recommended)
- [ ] Images optimized
- [ ] API responses fast (< 1s)
- [ ] No console errors in production
- [ ] Environment variables secure (no hardcoded secrets)
- [ ] HTTPS enforced
- [ ] Database queries optimized
- [ ] Rate limiting considered

### 10. Monitoring and Maintenance

- [ ] Error logging configured
- [ ] Performance monitoring setup
- [ ] Uptime monitoring configured
- [ ] Backup schedule established
- [ ] Disaster recovery plan documented
- [ ] Support contact available

## Validation Commands

Run these commands to verify your setup:

```bash
# Check TypeScript compilation
pnpm check

# Validate environment variables
pnpm validate

# Verify routes
pnpm verify:routes

# Test database connection
pnpm db:test

# Check server health
pnpm health

# Build for production
pnpm build
```

## Common Issues and Solutions

### "Cannot connect to database"
**Solution**: 
- Verify `DATABASE_URL` is correct
- Ensure SSL is enabled for production databases
- Check firewall rules allow connections

### "Authentication failed"
**Solution**:
- Verify auth provider credentials
- Check callback URLs match exactly
- Ensure `JWT_SECRET` is configured

### "CORS error"
**Solution**:
- Verify `FRONTEND_URL` and `BACKEND_URL` are correct
- Ensure both use HTTPS in production
- Check for trailing slashes (should not have them)

### "Stripe webhook not working"
**Solution**:
- Verify webhook URL is publicly accessible
- Check `STRIPE_WEBHOOK_SECRET` matches dashboard
- Ensure endpoint URL includes `/api/stripe/webhook`
- Review Stripe dashboard logs

### "Build failed"
**Solution**:
- Run `pnpm install` to ensure dependencies are installed
- Check for TypeScript errors: `pnpm check`
- Verify all imports are correct
- Check build logs for specific errors

## Post-Deployment

After successful deployment:

1. [ ] Monitor logs for first 24 hours
2. [ ] Test all critical user flows
3. [ ] Check performance metrics
4. [ ] Review error reports
5. [ ] Update documentation with actual URLs
6. [ ] Notify stakeholders of deployment
7. [ ] Create tagged release in Git
8. [ ] Document any deployment issues encountered

## Emergency Rollback Plan

If critical issues occur:

1. Identify the issue from logs
2. If database migration issue: Restore previous backup
3. If code issue: 
   - Revert to previous Git commit
   - Redeploy from working branch
4. Notify users of temporary issues
5. Fix issue in development
6. Re-deploy after thorough testing

## Support Contacts

- Technical Issues: [your-email@example.com]
- Database: [Database provider support]
- Hosting: [Hosting provider support]
- Payments: [Stripe support]

---

**Last Updated**: December 2024
**Version**: 1.0.0
