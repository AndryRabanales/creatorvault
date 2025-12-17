# Troubleshooting Guide

This guide covers common issues you might encounter when developing or deploying CreatorVault.

## Table of Contents

- [Development Issues](#development-issues)
- [Deployment Issues](#deployment-issues)
- [Database Issues](#database-issues)
- [Authentication Issues](#authentication-issues)
- [Payment Issues](#payment-issues)
- [Frontend Issues](#frontend-issues)
- [Backend Issues](#backend-issues)

---

## Development Issues

### Cannot start development server

**Symptoms**: Error when running `pnpm dev`

**Possible Causes**:
1. Dependencies not installed
2. Port already in use
3. Database not configured

**Solutions**:

```bash
# 1. Install dependencies
pnpm install

# 2. Check if port 3000 is in use
lsof -ti:3000 | xargs kill  # Mac/Linux
# Or change PORT in .env file
PORT=3001

# 3. Configure minimal environment variables
cp .env.example .env
# Edit .env and add at minimum:
# DATABASE_URL=...
# JWT_SECRET=...
```

### TypeScript errors

**Symptoms**: Red squiggly lines in VS Code or build errors

**Solutions**:

```bash
# Check for errors
pnpm check

# If errors about missing types:
pnpm install

# If errors persist, restart TypeScript server in VS Code:
# Cmd+Shift+P -> "TypeScript: Restart TS Server"
```

### Hot reload not working

**Symptoms**: Changes not reflected in browser

**Solutions**:

1. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
2. Clear browser cache
3. Restart dev server
4. Check browser console for errors

### Database migrations failing

**Symptoms**: Error when running `pnpm db:push`

**Solutions**:

```bash
# 1. Check DATABASE_URL is correct
echo $DATABASE_URL

# 2. Test database connection
pnpm db:test

# 3. If connection works but migrations fail:
# Delete existing tables (⚠️ CAUTION: LOSES DATA)
# Then run migrations again
pnpm db:push

# 4. Check Drizzle logs for specific errors
```

---

## Deployment Issues

### Build fails

**Symptoms**: Error during `pnpm build`

**Common Errors**:

#### 1. "Module not found"
```bash
# Solution: Install dependencies
pnpm install

# Check if all imports are correct
pnpm check
```

#### 2. "Out of memory"
```bash
# Solution: Increase Node.js memory
NODE_OPTIONS=--max-old-space-size=4096 pnpm build
```

#### 3. "Environment variable not found"
```bash
# Solution: These are warnings for optional variables
# Can be ignored if you don't need those features
# Or add the missing variables to .env
```

### Deployment succeeds but site doesn't work

**Symptoms**: Site loads but shows errors or blank page

**Debugging Steps**:

1. Check browser console for errors (F12)
2. Check API URL is correct:
   ```bash
   # Should match your backend URL
   echo $VITE_API_URL
   ```
3. Check CORS configuration in backend
4. Verify all environment variables are set in hosting platform

### Health check fails

**Symptoms**: `/api/health` returns error or timeout

**Solutions**:

```bash
# 1. Check server is running
curl https://your-backend-url.com/api/health

# 2. Check logs in hosting platform (Railway, Render, etc.)

# 3. Verify environment variables are set

# 4. Check database connectivity
# Look for "database: configured" in health check response
```

---

## Database Issues

### "Cannot connect to database"

**Symptoms**: Database connection errors in logs

**Solutions**:

1. **Verify DATABASE_URL format**:
   ```bash
   # PostgreSQL (with SSL)
   postgresql://user:password@host:5432/database?sslmode=require
   
   # MySQL
   mysql://user:password@host:3306/database
   ```

2. **Check SSL requirements**:
   - Neon: REQUIRES `?sslmode=require`
   - PlanetScale: Requires SSL in URL
   - Railway: Check if SSL is enabled

3. **Test connection**:
   ```bash
   pnpm db:test
   ```

4. **Check firewall rules**:
   - Ensure your IP is whitelisted
   - Or check if database allows all IPs (for cloud hosting)

### "Table does not exist"

**Symptoms**: Queries fail with "table not found"

**Solutions**:

```bash
# Run migrations
pnpm db:push

# If that fails, check:
# 1. DATABASE_URL is correct
# 2. You have permission to create tables
# 3. Database exists
```

### Slow database queries

**Symptoms**: API requests take > 2 seconds

**Solutions**:

1. Check database location (should be close to server)
2. Add indexes to frequently queried columns
3. Review slow queries in database dashboard
4. Consider upgrading database plan

---

## Authentication Issues

### "Authentication failed"

**Symptoms**: Cannot log in or "Unauthorized" errors

**Solutions**:

#### If using Auth0:

1. **Verify credentials**:
   ```bash
   # Check these are set and correct:
   echo $AUTH0_DOMAIN
   echo $AUTH0_CLIENT_ID
   # SECRET should be set but not echoed
   ```

2. **Check callback URL**:
   - In Auth0 dashboard, verify:
   - Allowed Callback URLs: `https://your-backend.com/api/oauth/callback`
   - Allowed Logout URLs: `https://your-frontend.com`

3. **Check domain format**:
   ```bash
   # Should be: your-tenant.auth0.com
   # NOT: https://your-tenant.auth0.com
   ```

#### If using Clerk:

1. **Verify API keys**:
   ```bash
   # Check these are set:
   echo $CLERK_SECRET_KEY
   echo $VITE_CLERK_PUBLISHABLE_KEY
   ```

2. **Check environment** (test vs production):
   - Test keys start with `pk_test_` and `sk_test_`
   - Live keys start with `pk_live_` and `sk_live_`
   - Don't mix test and live keys!

### "Session expired" too quickly

**Symptoms**: Users logged out frequently

**Solutions**:

1. Check `JWT_SECRET` is set and consistent
2. Ensure cookies are being set correctly
3. Check browser cookie settings (3rd party cookies)
4. Review session expiry time in code

### "Redirect loop" on login

**Symptoms**: Browser keeps redirecting, never completes login

**Solutions**:

1. Clear browser cookies and cache
2. Check `FRONTEND_URL` and `BACKEND_URL` are correct
3. Ensure URLs use HTTPS in production
4. Verify callback URL in auth provider settings

---

## Payment Issues (Stripe)

### "Invalid API key"

**Symptoms**: Stripe operations fail with auth error

**Solutions**:

```bash
# 1. Verify keys are set:
echo $STRIPE_SECRET_KEY
echo $VITE_STRIPE_PUBLISHABLE_KEY

# 2. Check key format:
# Secret: sk_test_... or sk_live_...
# Publishable: pk_test_... or pk_live_...

# 3. Don't mix test and live keys!
# Both should be either test OR live

# 4. Regenerate keys if needed in Stripe dashboard
```

### Webhook not receiving events

**Symptoms**: Payments work but no updates in app

**Debugging**:

1. **Check webhook URL is correct**:
   - Should be: `https://your-backend.com/api/stripe/webhook`
   - Must be publicly accessible
   - Cannot be localhost (use ngrok for local testing)

2. **Check webhook secret**:
   ```bash
   echo $STRIPE_WEBHOOK_SECRET
   # Should start with: whsec_
   ```

3. **View webhook logs in Stripe dashboard**:
   - Go to Developers → Webhooks
   - Click your endpoint
   - View recent deliveries
   - Check response codes

4. **Test webhook locally**:
   ```bash
   # Use Stripe CLI
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   stripe trigger checkout.session.completed
   ```

### Test payments not working

**Symptoms**: Stripe checkout loads but payment fails

**Solutions**:

1. **Use test card numbers**:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - Any future expiry date
   - Any 3-digit CVC

2. **Check Stripe keys are test keys** (`sk_test_...`)

3. **Verify webhook endpoint is configured**

---

## Frontend Issues

### "API call failed" / CORS errors

**Symptoms**: Network errors in browser console, API calls fail

**Solutions**:

1. **Check VITE_API_URL**:
   ```bash
   # Should match your backend URL exactly:
   echo $VITE_API_URL
   # Example: https://your-backend.railway.app
   ```

2. **Verify CORS on backend**:
   - Check `FRONTEND_URL` is set correctly
   - Should match your actual frontend domain
   - No trailing slash

3. **Check both use HTTPS** in production

4. **Test API directly**:
   ```bash
   curl https://your-backend.com/api/health
   ```

### Page shows "Not Found" (404)

**Symptoms**: Clicking links goes to 404 page

**Solutions**:

1. **Verify route exists in App.tsx**

2. **Check if using correct navigation**:
   ```tsx
   // Correct:
   <Link href="/marketplace">Go</Link>
   setLocation("/marketplace")
   
   // Incorrect:
   <a href="/marketplace">Go</a>  // Works but doesn't use React Router
   ```

3. **Clear browser cache and hard refresh**

### UI components not styled correctly

**Symptoms**: Components look broken or unstyled

**Solutions**:

1. Check TailwindCSS is installed: `pnpm install`
2. Clear build cache: `rm -rf dist`
3. Rebuild: `pnpm build`
4. Check browser console for CSS errors

---

## Backend Issues

### Server crashes on startup

**Symptoms**: Server starts then immediately exits

**Solutions**:

1. **Check logs** for specific error

2. **Common causes**:
   ```bash
   # Missing environment variables
   pnpm validate
   
   # Database connection failed
   pnpm db:test
   
   # Port already in use
   # Change PORT in .env
   ```

3. **Test with minimal config**:
   ```bash
   # Create minimal .env:
   DATABASE_URL=...
   JWT_SECRET=...
   ```

### API requests timeout

**Symptoms**: Requests take very long or timeout

**Solutions**:

1. Check database connection speed
2. Review slow queries in logs
3. Check if server has enough resources (RAM, CPU)
4. Consider adding caching
5. Optimize database queries

### "Internal Server Error" (500)

**Symptoms**: API calls return 500 error

**Debugging**:

1. **Check server logs** for stack trace

2. **Common causes**:
   - Database query failed
   - Missing environment variable
   - Unhandled exception in code
   - Invalid data format

3. **Test specific endpoint**:
   ```bash
   curl -v https://your-backend.com/api/trpc/auth.me
   ```

---

## Still Having Issues?

### Debugging Process

1. **Check logs first**:
   - Browser console (F12)
   - Server logs (Railway/Render dashboard)
   - Database logs

2. **Run validation scripts**:
   ```bash
   pnpm check          # TypeScript errors
   pnpm validate       # Environment variables
   pnpm verify:routes  # Route configuration
   pnpm health         # Server health
   ```

3. **Test in isolation**:
   - Frontend only: `cd client && pnpm dev`
   - Backend only: `pnpm dev`
   - Database: `pnpm db:test`

4. **Check versions**:
   ```bash
   node --version   # Should be 18+
   pnpm --version   # Should be 8+
   ```

5. **Try fresh install**:
   ```bash
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   ```

### Getting Help

When asking for help, include:

1. **What you tried**: Steps you followed
2. **Expected result**: What should happen
3. **Actual result**: What actually happened
4. **Error messages**: Complete error text
5. **Environment**: OS, Node version, browser
6. **Logs**: Relevant logs from console/server

### Resources

- [Documentation](../README.md)
- [Deployment Guide](../DEPLOYMENT_GUIDE.md)
- [Environment Variables](./ENV_VARIABLES.md)
- [Deployment Checklist](../DEPLOYMENT_CHECKLIST.md)

---

**Last Updated**: December 2024
