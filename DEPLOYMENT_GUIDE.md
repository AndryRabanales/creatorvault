# CreatorVault - Guía Completa de Deployment Independiente

Esta guía te permitirá tener control total de CreatorVault en tu propia infraestructura.

---

## 📋 Resumen de Costos Mensuales Estimados

| Servicio | Opción Gratuita | Opción Paga |
|----------|-----------------|-------------|
| **Base de Datos** | Neon (gratis) / PlanetScale (gratis) | $5-20/mes |
| **Hosting Backend** | Railway ($5 crédito gratis) / Render (gratis) | $7-25/mes |
| **Hosting Frontend** | Vercel (gratis) / Netlify (gratis) | $0-20/mes |
| **Dominio** | - | $10-15/año |
| **Stripe** | Gratis (solo comisión por transacción) | 2.9% + $0.30 |
| **Total Inicial** | **$0/mes** | **$15-50/mes** |

---

## 🚀 PASO 1: Descargar el Código

### Opción A: Desde Manus (Recomendado)
1. En la interfaz de Manus, haz clic en el panel **"Code"** (lado derecho)
2. Haz clic en **"Download All Files"** para descargar el ZIP
3. Descomprime el archivo en tu computadora

### Opción B: Clonar desde el sandbox
```bash
# Si tienes acceso SSH al sandbox
scp -r ubuntu@sandbox:/home/ubuntu/creatorvault ./creatorvault
```

---

## 🐙 PASO 2: Subir a GitHub

### 2.1 Crear cuenta en GitHub (si no tienes)
1. Ve a https://github.com
2. Crea una cuenta gratuita

### 2.2 Crear repositorio
1. Haz clic en **"New Repository"**
2. Nombre: `creatorvault`
3. Privado o Público (tu elección)
4. NO inicialices con README

### 2.3 Subir el código
```bash
# Navega a la carpeta del proyecto
cd creatorvault

# Inicializa git
git init

# Agrega todos los archivos
git add .

# Crea el primer commit
git commit -m "CreatorVault MVP - Initial commit"

# Conecta con tu repositorio (reemplaza TU_USUARIO)
git remote add origin https://github.com/TU_USUARIO/creatorvault.git

# Sube el código
git branch -M main
git push -u origin main
```

---

## 🗄️ PASO 3: Configurar Base de Datos

### Opción A: Neon (Recomendado - Gratis)

1. **Crear cuenta**: https://neon.tech
2. **Crear proyecto**: 
   - Nombre: `creatorvault`
   - Región: La más cercana a ti
3. **Obtener Connection String**:
   - Ve a Dashboard → Connection Details
   - Copia el string que se ve así:
   ```
   postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```

### Opción B: PlanetScale (Gratis)

1. **Crear cuenta**: https://planetscale.com
2. **Crear database**: `creatorvault`
3. **Obtener credenciales**: Settings → Passwords → New Password

### Opción C: Railway (Simple)

1. **Crear cuenta**: https://railway.app
2. **New Project** → **Provision MySQL**
3. **Variables** → Copia `DATABASE_URL`

### 3.1 Migrar el esquema de base de datos

Una vez tengas tu `DATABASE_URL`, ejecuta:

```bash
# En tu terminal local
cd creatorvault

# Instala dependencias
pnpm install

# Configura la variable de entorno
export DATABASE_URL="tu_connection_string_aqui"

# Ejecuta las migraciones
pnpm db:push
```

---

## 💳 PASO 4: Configurar Stripe

### 4.1 Crear cuenta de Stripe
1. Ve a https://stripe.com
2. Crea una cuenta (gratis)
3. Completa la verificación de identidad

### 4.2 Obtener API Keys
1. Ve a **Developers** → **API Keys**
2. Copia:
   - **Publishable key**: `pk_test_...` (para frontend)
   - **Secret key**: `sk_test_...` (para backend)

### 4.3 Configurar Webhooks
1. Ve a **Developers** → **Webhooks**
2. **Add endpoint**:
   - URL: `https://tu-dominio.com/api/stripe/webhook`
   - Eventos a escuchar:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `checkout.session.completed`
3. Copia el **Webhook Secret**: `whsec_...`

---

## 🔐 PASO 5: Configurar Autenticación

### Opción A: Usar Auth0 (Recomendado para producción)

1. **Crear cuenta**: https://auth0.com (gratis hasta 7,000 usuarios)
2. **Crear Application**:
   - Type: Regular Web Application
   - Allowed Callback URLs: `https://tu-dominio.com/api/oauth/callback`
   - Allowed Logout URLs: `https://tu-dominio.com`
3. **Obtener credenciales**:
   - Domain
   - Client ID
   - Client Secret

### Opción B: Usar Clerk (Más simple)

1. **Crear cuenta**: https://clerk.com (gratis hasta 10,000 usuarios)
2. **Crear Application**
3. **Copiar API Keys**

### Opción C: Implementar autenticación propia

El código actual usa Manus OAuth. Para producción, necesitarás modificar:
- `server/_core/auth.ts`
- `server/_core/context.ts`

---

## 🌐 PASO 6: Hosting del Backend

### Opción A: Railway (Recomendado)

1. **Crear cuenta**: https://railway.app
2. **New Project** → **Deploy from GitHub repo**
3. **Selecciona** tu repositorio `creatorvault`
4. **Configura variables de entorno** (ver sección 7)
5. **Deploy**

Railway detectará automáticamente que es un proyecto Node.js.

### Opción B: Render

1. **Crear cuenta**: https://render.com
2. **New** → **Web Service**
3. **Connect GitHub** → Selecciona `creatorvault`
4. **Configuración**:
   - Build Command: `pnpm install && pnpm build`
   - Start Command: `pnpm start`
5. **Add Environment Variables**

### Opción C: DigitalOcean App Platform

1. **Crear cuenta**: https://digitalocean.com
2. **Create App** → **GitHub**
3. **Configurar** similar a Railway

---

## 🖥️ PASO 7: Hosting del Frontend

### Opción A: Vercel (Recomendado - Gratis)

1. **Crear cuenta**: https://vercel.com
2. **Import Project** → GitHub → `creatorvault`
3. **Framework Preset**: Vite
4. **Build Settings**:
   - Build Command: `pnpm build`
   - Output Directory: `dist`
5. **Environment Variables** (ver sección 8)

### Opción B: Netlify (Gratis)

1. **Crear cuenta**: https://netlify.com
2. **Add new site** → **Import from Git**
3. **Build settings**:
   - Build command: `pnpm build`
   - Publish directory: `dist`

---

## ⚙️ PASO 8: Variables de Entorno

### Variables del Backend (Railway/Render)

```env
# Base de datos
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# JWT Secret (genera uno aleatorio)
JWT_SECRET=genera_un_string_aleatorio_de_64_caracteres

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Auth (si usas Auth0)
AUTH0_DOMAIN=tu-tenant.auth0.com
AUTH0_CLIENT_ID=...
AUTH0_CLIENT_SECRET=...

# URLs
FRONTEND_URL=https://tu-frontend.vercel.app
```

### Variables del Frontend (Vercel/Netlify)

```env
# API URL
VITE_API_URL=https://tu-backend.railway.app

# Stripe (clave pública)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Auth
VITE_AUTH0_DOMAIN=tu-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=...
```

### Generar JWT_SECRET

```bash
# En tu terminal
openssl rand -base64 64
```

---

## 🌍 PASO 9: Configurar Dominio

### Opción A: Namecheap (Económico)
1. Ve a https://namecheap.com
2. Busca tu dominio (ej: `creatorvault.com`)
3. Compra (~$10-15/año para .com)

### Opción B: Cloudflare Registrar (Más barato)
1. Ve a https://cloudflare.com
2. Registrar dominio al costo

### Opción C: Google Domains
1. Ve a https://domains.google
2. Busca y compra

### 9.1 Conectar dominio a Vercel

1. En Vercel → Project Settings → Domains
2. Agrega tu dominio
3. Configura DNS en tu registrador:
   ```
   Tipo: CNAME
   Nombre: www
   Valor: cname.vercel-dns.com
   
   Tipo: A
   Nombre: @
   Valor: 76.76.21.21
   ```

### 9.2 Conectar dominio a Railway

1. En Railway → Project → Settings → Domains
2. Agrega dominio personalizado
3. Configura DNS según instrucciones de Railway

---

## 🔧 PASO 10: Modificaciones Necesarias al Código

### 10.1 Actualizar configuración de CORS

Edita `server/_core/index.ts`:

```typescript
// Agrega tu dominio a los orígenes permitidos
const allowedOrigins = [
  'https://tu-dominio.com',
  'https://www.tu-dominio.com',
  'http://localhost:3000', // para desarrollo
];
```

### 10.2 Actualizar URLs de OAuth

Edita `client/src/const.ts`:

```typescript
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
```

### 10.3 Actualizar Stripe webhook URL

En tu dashboard de Stripe, actualiza el webhook URL a:
```
https://tu-backend-url.com/api/stripe/webhook
```

---

## 📱 PASO 11: Verificación Final

### Checklist de deployment:

- [ ] Código subido a GitHub
- [ ] Base de datos creada y migrada
- [ ] Stripe configurado con webhooks
- [ ] Backend desplegado (Railway/Render)
- [ ] Frontend desplegado (Vercel/Netlify)
- [ ] Variables de entorno configuradas
- [ ] Dominio conectado
- [ ] SSL/HTTPS funcionando
- [ ] Login funciona correctamente
- [ ] Pagos de prueba funcionan

### Comandos de prueba:

```bash
# Probar que el backend responde
curl https://tu-backend.railway.app/api/health

# Probar conexión a base de datos
curl https://tu-backend.railway.app/api/trpc/auth.me
```

---

## 🛠️ PASO 12: Mantenimiento

### Actualizar código
```bash
git add .
git commit -m "Descripción del cambio"
git push origin main
# Railway/Vercel detectarán el cambio y re-deployarán automáticamente
```

### Ver logs
- **Railway**: Dashboard → Deployments → View Logs
- **Vercel**: Dashboard → Deployments → Functions → Logs

### Backups de base de datos
- **Neon**: Automáticos incluidos
- **PlanetScale**: Automáticos incluidos
- **Railway**: Configura backups manuales

---

## 💰 Resumen de Costos para Empezar GRATIS

| Servicio | Costo |
|----------|-------|
| Neon (DB) | $0 |
| Railway (Backend) | $0 (primeros $5 gratis) |
| Vercel (Frontend) | $0 |
| Stripe | $0 (solo pagas comisión cuando vendes) |
| **TOTAL** | **$0/mes** |

Cuando crezcas, puedes escalar:
- Neon Pro: $19/mes
- Railway: ~$20/mes
- Dominio: $12/año

---

## 🆘 Solución de Problemas Comunes

### Error: "Cannot connect to database"
- Verifica que `DATABASE_URL` esté correctamente configurado
- Asegúrate de incluir `?sslmode=require` al final

### Error: "Stripe webhook failed"
- Verifica que el webhook secret sea correcto
- Asegúrate de que la URL del webhook sea accesible públicamente

### Error: "CORS blocked"
- Agrega tu dominio a la lista de orígenes permitidos en el backend

### Error: "Auth failed"
- Verifica las URLs de callback en tu proveedor de auth
- Asegúrate de que las variables de entorno estén configuradas

---

## 📞 Recursos Adicionales

- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **Stripe Docs**: https://stripe.com/docs
- **Neon Docs**: https://neon.tech/docs

---

**¡Felicidades! Ahora tienes control total de CreatorVault.** 🎉
