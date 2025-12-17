# Variables de Entorno para CreatorVault

## 🔍 Validación Rápida

Usa el script de validación para verificar tu configuración:

```bash
pnpm validate
```

Este script verificará que todas las variables requeridas estén configuradas correctamente.

---

## Variables Requeridas

### Base de Datos
```bash
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

**Descripción**: String de conexión a la base de datos

**Dónde obtenerlo**:
- **Neon**: Dashboard → Connection Details
- **PlanetScale**: Settings → Passwords
- **Railway**: Variables → DATABASE_URL

**Formatos soportados**:
```bash
# PostgreSQL (Neon, Supabase)
postgresql://user:password@host:5432/database?sslmode=require

# MySQL (PlanetScale, Railway)
mysql://user:password@host:3306/database
```

**⚠️ Importante**: En producción SIEMPRE usa SSL

---

### Autenticación

#### JWT_SECRET (Requerido)
```bash
JWT_SECRET=tu_jwt_secret_aqui_minimo_64_caracteres_super_seguro
```

**Descripción**: Secret para firmar tokens de sesión

**Cómo generarlo**:
```bash
# En terminal
openssl rand -base64 64

# O en Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

**⚠️ Importante**: 
- Usa al menos 64 caracteres
- NUNCA lo compartas públicamente
- Usa uno diferente para desarrollo y producción

---

### Stripe (Pagos)

```bash
# Backend (Secret Key)
STRIPE_SECRET_KEY=sk_test_51XXXXX...

# Webhook Secret
STRIPE_WEBHOOK_SECRET=whsec_XXXXX...

# Frontend (Publishable Key)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51XXXXX...
```

**Dónde obtenerlos**:
1. Ve a https://dashboard.stripe.com/apikeys
2. Copia las claves correspondientes
3. Para webhook secret: Developers → Webhooks → [tu endpoint] → Signing secret

**Test vs Production**:
- Test keys: `sk_test_...` y `pk_test_...`
- Live keys: `sk_live_...` y `pk_live_...`
- ⚠️ NUNCA mezcles test con live

---

### URLs

```bash
# URL del frontend (para CORS y redirects)
FRONTEND_URL=https://tu-dominio.com

# URL del backend (para webhooks)
BACKEND_URL=https://api.tu-dominio.com
```

**Para desarrollo local**:
```bash
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3000
```

**Para producción**:
```bash
# Vercel + Railway
FRONTEND_URL=https://creatorvault.vercel.app
BACKEND_URL=https://creatorvault-production.up.railway.app
```

---

## Variables Opcionales (Recomendadas)

### Servidor

```bash
# Modo de ejecución
NODE_ENV=production

# Puerto del servidor
PORT=3000
```

**Valores válidos para NODE_ENV**:
- `development`: Modo desarrollo (Vite, hot reload)
- `production`: Modo producción (archivos estáticos)
- `test`: Para testing

---

## Proveedores de Autenticación

### Opción A: Auth0 (Recomendado para producción)

```bash
# Backend
AUTH0_DOMAIN=tu-tenant.auth0.com
AUTH0_CLIENT_ID=xxxxxxxxxxxxx
AUTH0_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxx
AUTH0_CALLBACK_URL=https://tu-dominio.com/api/oauth/callback

# Frontend
VITE_AUTH0_DOMAIN=tu-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=xxxxxxxxxxxxx
```

**Dónde obtenerlos**:
1. Ve a https://auth0.com
2. Applications → [tu app] → Settings
3. Copia Domain, Client ID y Client Secret

**Configuración en Auth0**:
- Allowed Callback URLs: `https://tu-dominio.com/api/oauth/callback`
- Allowed Logout URLs: `https://tu-dominio.com`
- Allowed Web Origins: `https://tu-dominio.com`

---

### Opción B: Clerk (Más simple)

```bash
# Backend
CLERK_SECRET_KEY=sk_test_xxxxx

# Frontend
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
```

**Dónde obtenerlos**:
1. Ve a https://clerk.com
2. [Tu app] → API Keys
3. Copia Secret Key y Publishable Key

---

### Opción C: Manus OAuth (Solo desarrollo)

```bash
VITE_APP_ID=tu_app_id
OAUTH_SERVER_URL=https://oauth.manus.ai
OWNER_OPEN_ID=tu_open_id
```

**⚠️ Nota**: Solo para desarrollo local con Manus. Para producción usa Auth0 o Clerk.

---

## Configuración por Plataforma

### Railway (Backend)

1. Ve a tu proyecto en Railway
2. Click en tu servicio
3. Variables → Add Variable
4. Agrega cada variable:

```bash
DATABASE_URL=...
JWT_SECRET=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
FRONTEND_URL=...
NODE_ENV=production
```

5. Railway reiniciará automáticamente

**💡 Tip**: Usa el botón "Paste .env" para copiar múltiples variables

---

### Vercel (Frontend)

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega las variables con prefijo `VITE_`:

```bash
VITE_API_URL=https://tu-backend.railway.app
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_AUTH0_DOMAIN=tu-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=...
```

4. Redeploy: Deployments → [...] → Redeploy

**⚠️ Importante**: Solo las variables con prefijo `VITE_` son accesibles en el frontend

---

### Render (Backend o Frontend)

1. Ve a tu servicio en Render
2. Environment → Add Environment Variable
3. Agrega cada variable necesaria
4. El servicio se reiniciará automáticamente

**💡 Tip**: Puedes usar "Add from .env" para importar un archivo

---

## Validación de Variables

### Script de validación

```bash
# Verificar configuración
pnpm validate
```

Este script verifica:
- ✅ Todas las variables requeridas están configuradas
- ✅ Los formatos son correctos (claves de Stripe, URLs, etc.)
- ✅ Al menos un proveedor de auth está configurado
- ⚠️ Variables opcionales faltantes

### Verificación manual

```bash
# Ver variables actuales (oculta valores sensibles)
node -e "console.log(Object.keys(process.env).filter(k => k.includes('STRIPE') || k.includes('AUTH')).join('\n'))"
```

---

## Ejemplos Completos

### Desarrollo Local

```bash
# .env
NODE_ENV=development
PORT=3000
DATABASE_URL=mysql://root:password@localhost:3306/creatorvault
JWT_SECRET=dev_secret_at_least_32_characters_long_for_security
STRIPE_SECRET_KEY=sk_test_51xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51xxx
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3000
```

### Producción (Railway + Vercel + Auth0)

**Railway (Backend)**:
```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
JWT_SECRET=[64+ caracteres aleatorios]
STRIPE_SECRET_KEY=sk_live_51xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
AUTH0_DOMAIN=tu-tenant.auth0.com
AUTH0_CLIENT_ID=xxx
AUTH0_CLIENT_SECRET=xxx
AUTH0_CALLBACK_URL=https://tu-dominio.com/api/oauth/callback
FRONTEND_URL=https://tu-dominio.vercel.app
```

**Vercel (Frontend)**:
```bash
VITE_API_URL=https://tu-backend.railway.app
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51xxx
VITE_AUTH0_DOMAIN=tu-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=xxx
```

---

## Seguridad

### ✅ Buenas Prácticas

- ✅ Usa variables diferentes para desarrollo y producción
- ✅ Nunca commits `.env` al repositorio
- ✅ Rota secrets regularmente (cada 90 días)
- ✅ Usa SSL/HTTPS en producción
- ✅ Limita el acceso a variables de entorno

### ❌ Nunca hagas esto

- ❌ Compartir secrets públicamente
- ❌ Usar la misma JWT_SECRET en dev y prod
- ❌ Exponer variables de backend en el frontend
- ❌ Hardcodear secrets en el código
- ❌ Mezclar claves de test y live de Stripe

---

## Solución de Problemas

### "Variable no encontrada"
```bash
# Verifica que esté configurada
echo $DATABASE_URL

# En Railway/Vercel, verifica el dashboard
```

### "Invalid format"
```bash
# Ejecuta el validador
pnpm validate

# Te dirá exactamente qué está mal
```

### "CORS error"
```bash
# Asegúrate de que FRONTEND_URL coincida con tu dominio real
FRONTEND_URL=https://tu-dominio-exacto.com
```
