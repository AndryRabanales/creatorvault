# ============================================
# CreatorVault - Production Dockerfile
# Frontend + Backend in one container
# ============================================
FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm npm

WORKDIR /app

# ============================================
# Dependencies
# ============================================
FROM base AS deps

COPY package.json package-lock.json* pnpm-lock.yaml* ./
COPY patches ./patches

# Install with npm (bypassing pnpm issues)
RUN npm install --legacy-peer-deps || pnpm install --frozen-lockfile

# ============================================
# Build Stage (Frontend + Backend)
# ============================================
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build BOTH frontend and backend
RUN npm run build

# ============================================
# Production Runner
# ============================================
FROM base AS runner

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 creatorvault

# Copy compiled assets
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/drizzle ./drizzle

USER creatorvault

EXPOSE 3000

ENV PORT=3000

CMD ["npm", "start"]

