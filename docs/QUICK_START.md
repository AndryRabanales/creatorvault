# Quick Start Guide

Get CreatorVault running locally in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)
- Database (MySQL or PostgreSQL)
- Stripe account (for payments)

## Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/creatorvault.git
cd creatorvault

# Install dependencies
pnpm install
```

## Step 2: Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your values
nano .env  # or use your favorite editor
```

### Minimum Required Configuration

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/creatorvault

# Authentication
JWT_SECRET=your-super-secret-key-at-least-32-characters-long

# Auth Provider (choose one)
# Option A: Auth0
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-secret

# Option B: Clerk
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

# Stripe (optional for payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Generate JWT Secret

```bash
# Run one of these:
openssl rand -base64 64
# or
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

## Step 3: Setup Database

```bash
# Run migrations
pnpm db:push

# Verify database connection
pnpm db:test
```

## Step 4: Validate Configuration

```bash
# Check all environment variables
pnpm validate

# Should see all checkmarks ✅
```

## Step 5: Start Development Server

```bash
# Start dev server (includes frontend and backend)
pnpm dev

# Server will start on http://localhost:3000
```

## Step 6: Access the Application

Open your browser to:
```
http://localhost:3000
```

## Verify Everything Works

### Check Server Health
```bash
# In another terminal:
pnpm health

# Should show:
# ✅ Server is running
# ✅ Database configured
# etc.
```

### Check Routes
```bash
pnpm verify:routes

# Should show:
# ✅ All routes verified successfully!
```

### Check TypeScript
```bash
pnpm check

# Should complete with no errors
```

## Common First-Time Issues

### "Cannot connect to database"

**Solution**: Verify your `DATABASE_URL` is correct

```bash
# For local PostgreSQL:
DATABASE_URL=postgresql://postgres:password@localhost:5432/creatorvault

# For local MySQL:
DATABASE_URL=mysql://root:password@localhost:3306/creatorvault
```

### "Authentication failed"

**Solution**: Choose and configure ONE auth provider

For development, the easiest options are:
1. **Clerk** (simplest, no configuration needed)
2. **Auth0** (requires callback URL setup)

### "Port 3000 already in use"

**Solution**: Either kill the process or use a different port

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill

# Or change port in .env
PORT=3001
```

### "Missing Stripe configuration"

**Solution**: If you don't need payments yet, you can skip Stripe

The app will work without payments, but payment features will be disabled.

## Next Steps

### For Creators
1. Go to http://localhost:3000
2. Click "Get Started"
3. Sign in with your auth provider
4. Select "Creator" role
5. Complete onboarding
6. Browse campaigns

### For Brands
1. Go to http://localhost:3000
2. Click "Get Started"
3. Sign in with your auth provider
4. Select "Brand" role
5. Complete onboarding
6. Create a campaign

### Development Workflow

```bash
# Make changes to files
# Files auto-reload on save

# Run checks before committing
pnpm check          # TypeScript
pnpm verify:routes  # Routes
pnpm validate       # Environment

# Format code
pnpm format

# Build for production
pnpm build
```

## Project Structure

```
creatorvault/
├── client/               # React frontend
│   ├── src/
│   │   ├── pages/       # Page components
│   │   ├── components/  # Reusable components
│   │   ├── lib/         # Utilities
│   │   └── App.tsx      # Main app with routes
│   └── index.html       # HTML template
├── server/              # Express backend
│   ├── _core/          # Core server code
│   ├── stripe/         # Stripe integration
│   ├── routers.ts      # tRPC API routes
│   └── db.ts           # Database queries
├── drizzle/            # Database schema
├── scripts/            # Utility scripts
└── docs/               # Documentation
```

## Available Scripts

```bash
pnpm dev           # Start development server
pnpm build         # Build for production
pnpm start         # Start production server
pnpm check         # TypeScript type checking
pnpm validate      # Validate environment
pnpm verify:routes # Verify route configuration
pnpm health        # Check server health
pnpm db:push       # Run database migrations
pnpm db:test       # Test database connection
pnpm format        # Format code with Prettier
pnpm test          # Run tests
```

## Getting Help

- **Troubleshooting**: See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **Environment Variables**: See [ENV_VARIABLES.md](./ENV_VARIABLES.md)
- **Deployment**: See [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md)
- **Full README**: See [README.md](../README.md)

## Tips for Development

1. **Use the browser console** (F12) to see errors
2. **Check server terminal** for backend errors
3. **Use hot reload** - changes apply instantly
4. **Run validation often** - catch issues early
5. **Commit frequently** - save your progress

## Testing Payments Locally

If testing Stripe payments:

1. Use test credit card: `4242 4242 4242 4242`
2. Any future expiry date
3. Any 3-digit CVC
4. Use Stripe CLI for webhooks:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

## Ready to Deploy?

See the [Deployment Guide](../DEPLOYMENT_GUIDE.md) for step-by-step instructions on deploying to:
- Vercel (frontend)
- Railway (backend)
- Neon (database)

---

**You're all set!** 🎉

Start building and have fun with CreatorVault!
