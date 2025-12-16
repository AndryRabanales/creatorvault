# Variables de Entorno para CreatorVault

## Variables Requeridas

### Base de Datos
```
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```
Obtén esto de tu proveedor de base de datos (Neon, PlanetScale, Railway).

### Autenticación
```
JWT_SECRET=tu_jwt_secret_aqui_minimo_64_caracteres
```
Genera con: `openssl rand -base64 64`

### Stripe (Pagos)
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```
Obtén de: https://dashboard.stripe.com/apikeys

### URLs
```
FRONTEND_URL=https://tu-dominio.com
VITE_API_URL=https://api.tu-dominio.com
```

## Variables Opcionales

### Auth0 (si lo usas)
```
AUTH0_DOMAIN=tu-tenant.auth0.com
AUTH0_CLIENT_ID=...
AUTH0_CLIENT_SECRET=...
VITE_AUTH0_DOMAIN=tu-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=...
```

### Servidor
```
PORT=3000
NODE_ENV=production
```

## Configuración por Plataforma

### Railway
1. Ve a tu proyecto → Variables
2. Agrega cada variable una por una
3. Railway reiniciará automáticamente

### Vercel
1. Ve a Project Settings → Environment Variables
2. Agrega las variables con prefijo `VITE_` para el frontend
3. Redeploy para aplicar cambios

### Render
1. Ve a tu servicio → Environment
2. Agrega las variables
3. El servicio se reiniciará automáticamente
