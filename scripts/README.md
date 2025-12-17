# CreatorVault Scripts

Utility scripts for deployment, validation, and maintenance.

## Available Scripts

### 📋 validate-deployment.js

Validates that all required environment variables and configurations are properly set before deployment.

**Usage:**
```bash
pnpm validate
# or
node scripts/validate-deployment.js
```

**What it checks:**
- ✅ All required environment variables are set
- ✅ Variables have correct formats (Stripe keys, URLs, etc.)
- ✅ At least one auth provider is configured
- ✅ Database URL format is valid
- ⚠️ Optional variables and warnings

**Exit codes:**
- `0`: All checks passed (or passed with warnings)
- `1`: Critical errors found

---

### 🗄️ test-db-connection.js

Tests the database connection and provides diagnostics.

**Usage:**
```bash
pnpm db:test
# or
node scripts/test-db-connection.js
```

**What it does:**
- 🔌 Tests connection to the database
- 📊 Shows database name and version
- 📋 Counts existing tables
- 💡 Provides troubleshooting tips if connection fails

**Supports:**
- MySQL (PlanetScale, Railway)
- PostgreSQL (Neon, Supabase)

---

## Running Scripts

All scripts can be run using pnpm commands:

```bash
# Validate deployment configuration
pnpm validate

# Test database connection
pnpm db:test

# Both are also available via node directly
node scripts/validate-deployment.js
node scripts/test-db-connection.js
```

## Creating New Scripts

When creating new scripts:

1. Add shebang for direct execution:
   ```javascript
   #!/usr/bin/env node
   ```

2. Use ES modules syntax:
   ```javascript
   import { something } from 'somewhere';
   ```

3. Load environment variables:
   ```javascript
   import { config } from 'dotenv';
   config({ path: join(__dirname, '..', '.env') });
   ```

4. Provide clear error messages and exit codes

5. Add the script to `package.json`:
   ```json
   {
     "scripts": {
       "your-script": "node scripts/your-script.js"
     }
   }
   ```

6. Document it in this README

## Environment Variables

All scripts load environment variables from `.env` file in the project root.

Make sure to:
- Copy `.env.example` to `.env`
- Fill in your actual values
- Never commit `.env` to Git

## Troubleshooting

### "Cannot find module"

Make sure dependencies are installed:
```bash
pnpm install
```

### "DATABASE_URL not found"

Create a `.env` file and add your database URL:
```bash
cp .env.example .env
# Edit .env and add your DATABASE_URL
```

### Permission denied

Make scripts executable:
```bash
chmod +x scripts/*.js
```

### ES Module errors

Ensure `package.json` has:
```json
{
  "type": "module"
}
```

## CI/CD Integration

These scripts can be integrated into CI/CD pipelines:

**GitHub Actions example:**
```yaml
- name: Validate Configuration
  run: pnpm validate

- name: Test Database
  run: pnpm db:test
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

**Railway/Render:**
Add to build command:
```bash
pnpm install && pnpm validate && pnpm build
```

## Support

For issues or questions:
- 📖 Check the main [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md)
- 📋 Review [DEPLOYMENT_CHECKLIST.md](../docs/DEPLOYMENT_CHECKLIST.md)
- 🐛 Open an issue on GitHub
