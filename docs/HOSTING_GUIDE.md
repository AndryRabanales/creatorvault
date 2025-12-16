# Guía de Hosting para CreatorVault

## Arquitectura Recomendada

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Frontend     │────▶│    Backend      │────▶│    Database     │
│    (Vercel)     │     │   (Railway)     │     │    (Neon)       │
│    GRATIS       │     │   $5 gratis     │     │    GRATIS       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│    Dominio      │     │    Stripe       │
│   (~$12/año)    │     │  (comisión)     │
└─────────────────┘     └─────────────────┘
```

---

## Opción 1: Railway (Backend) + Vercel (Frontend)

### Costo: $0-5/mes

Esta es la opción más simple y económica.

### Paso 1: Deploy Backend en Railway

1. **Crear cuenta**: https://railway.app (usa GitHub para login)

2. **Crear proyecto**:
   - Click "New Project"
   - "Deploy from GitHub repo"
   - Autoriza acceso a tu repositorio
   - Selecciona `creatorvault`

3. **Configurar variables de entorno**:
   - Click en tu servicio
   - Ve a "Variables"
   - Agrega cada variable:
   ```
   DATABASE_URL=tu_connection_string
   JWT_SECRET=tu_jwt_secret
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   FRONTEND_URL=https://tu-app.vercel.app
   NODE_ENV=production
   ```

4. **Configurar dominio** (opcional):
   - Settings → Domains
   - Genera un dominio de Railway o agrega uno personalizado

5. **Verificar deployment**:
   - Ve a "Deployments"
   - Espera a que el build termine
   - Prueba: `https://tu-app.railway.app/api/health`

### Paso 2: Deploy Frontend en Vercel

1. **Crear cuenta**: https://vercel.com (usa GitHub)

2. **Importar proyecto**:
   - "Add New" → "Project"
   - Selecciona tu repositorio
   - Framework: Vite

3. **Configurar build**:
   ```
   Build Command: pnpm build
   Output Directory: dist
   Install Command: pnpm install
   ```

4. **Variables de entorno**:
   ```
   VITE_API_URL=https://tu-backend.railway.app
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

5. **Deploy**:
   - Click "Deploy"
   - Espera a que termine

---

## Opción 2: Render (Todo en uno)

### Costo: $0/mes (con limitaciones)

Render puede hostear frontend y backend juntos.

### Paso 1: Crear cuenta
https://render.com

### Paso 2: Crear Web Service (Backend)

1. "New" → "Web Service"
2. Conecta tu GitHub
3. Selecciona repositorio
4. Configuración:
   ```
   Name: creatorvault-api
   Environment: Node
   Build Command: pnpm install && pnpm build
   Start Command: pnpm start
   ```

5. Variables de entorno (igual que Railway)

### Paso 3: Crear Static Site (Frontend)

1. "New" → "Static Site"
2. Selecciona el mismo repositorio
3. Configuración:
   ```
   Name: creatorvault-web
   Build Command: pnpm build
   Publish Directory: dist
   ```

### Limitaciones del tier gratuito:
- El servicio se "duerme" después de 15 min de inactividad
- Tarda ~30 segundos en "despertar"
- 750 horas de ejecución/mes

---

## Opción 3: DigitalOcean App Platform

### Costo: ~$5-12/mes

Más profesional, sin limitaciones de "sleep".

### Paso 1: Crear cuenta
https://digitalocean.com (obtén $200 de crédito gratis)

### Paso 2: Crear App

1. "Create" → "Apps"
2. Conecta GitHub
3. Selecciona repositorio
4. DigitalOcean detectará la configuración

### Paso 3: Configurar recursos

- Web Service: $5/mes (básico)
- Database: Usar Neon externo (gratis)

---

## Opción 4: VPS Propio (Máximo Control)

### Costo: $4-6/mes

Para máximo control y mejor precio a largo plazo.

### Proveedores recomendados:
- **DigitalOcean**: $4/mes (1GB RAM)
- **Vultr**: $5/mes (1GB RAM)
- **Hetzner**: €3.29/mes (mejor precio/rendimiento)

### Setup con Docker

1. **Crear VPS** y conectar por SSH

2. **Instalar Docker**:
```bash
curl -fsSL https://get.docker.com | sh
```

3. **Clonar repositorio**:
```bash
git clone https://github.com/TU_USUARIO/creatorvault.git
cd creatorvault
```

4. **Crear archivo .env**:
```bash
nano .env
# Pega todas tus variables de entorno
```

5. **Build y run**:
```bash
docker build -t creatorvault .
docker run -d -p 3000:3000 --env-file .env creatorvault
```

6. **Configurar Nginx** (reverse proxy):
```bash
apt install nginx
```

```nginx
# /etc/nginx/sites-available/creatorvault
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

7. **SSL con Certbot**:
```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d tu-dominio.com
```

---

## Configurar Dominio Personalizado

### Paso 1: Comprar dominio

Opciones económicas:
- **Namecheap**: ~$10/año para .com
- **Cloudflare Registrar**: Precio de costo
- **Porkbun**: Buenos precios

### Paso 2: Configurar DNS

#### Para Vercel:
```
Tipo: A
Nombre: @
Valor: 76.76.21.21

Tipo: CNAME
Nombre: www
Valor: cname.vercel-dns.com
```

#### Para Railway:
```
Tipo: CNAME
Nombre: api (o @)
Valor: tu-app.railway.app
```

### Paso 3: Verificar SSL

- Vercel y Railway configuran SSL automáticamente
- Espera 5-10 minutos después de configurar DNS

---

## Checklist de Deployment

### Antes de deployar:
- [ ] Código subido a GitHub
- [ ] Base de datos creada y migrada
- [ ] Variables de entorno listas
- [ ] Stripe configurado

### Durante deployment:
- [ ] Backend desplegado y funcionando
- [ ] Frontend desplegado y funcionando
- [ ] Variables de entorno configuradas en ambos
- [ ] CORS configurado correctamente

### Después de deployar:
- [ ] Probar login/registro
- [ ] Probar creación de campaña
- [ ] Probar pago de prueba con Stripe
- [ ] Verificar webhooks de Stripe
- [ ] Configurar dominio personalizado
- [ ] Verificar SSL funcionando

---

## Monitoreo y Logs

### Railway
- Dashboard → Deployments → View Logs
- Métricas de uso en tiempo real

### Vercel
- Dashboard → Deployments → Functions
- Analytics incluidos

### Render
- Dashboard → Logs
- Métricas básicas incluidas

---

## Escalamiento Futuro

Cuando crezcas, considera:

1. **CDN**: Cloudflare (gratis) para cachear assets
2. **Database**: Upgrade a plan pago de Neon/PlanetScale
3. **Backend**: Más instancias o upgrade de plan
4. **Monitoring**: Agregar Sentry para errores
