# ============================================
# CreatorVault - Dockerfile
# ============================================
# Usar para deployment en: DigitalOcean, AWS, Google Cloud, etc.

FROM node:20-alpine AS base

# Instalar pnpm
RUN npm install -g pnpm

WORKDIR /app

# ============================================
# Etapa de dependencias
# ============================================
FROM base AS deps

COPY package.json pnpm-lock.yaml ./
COPY patches ./patches
RUN pnpm install --frozen-lockfile

# ============================================
# Etapa de build
# ============================================
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm build

# ============================================
# Etapa de producción
# ============================================
FROM base AS runner

ENV NODE_ENV=production

# Crear usuario no-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 creatorvault

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER creatorvault

EXPOSE 3000

ENV PORT=3000

CMD ["pnpm", "start"]

