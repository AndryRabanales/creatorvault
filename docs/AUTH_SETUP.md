# Configuración de Autenticación para CreatorVault

El código actual usa Manus OAuth. Para deployment independiente, tienes varias opciones:

---

## Opción 1: Auth0 (Recomendado)

Auth0 es robusto, seguro y tiene un tier gratuito generoso.

### Paso 1: Crear Cuenta
1. Ve a https://auth0.com
2. Sign up (gratis hasta 7,000 usuarios activos)

### Paso 2: Crear Application
1. Applications → Create Application
2. Nombre: "CreatorVault"
3. Tipo: "Regular Web Application"
4. Click "Create"

### Paso 3: Configurar URLs
En la configuración de tu aplicación:

```
Allowed Callback URLs:
https://tu-dominio.com/api/oauth/callback
http://localhost:3000/api/oauth/callback

Allowed Logout URLs:
https://tu-dominio.com
http://localhost:3000

Allowed Web Origins:
https://tu-dominio.com
http://localhost:3000
```

### Paso 4: Obtener Credenciales
En Settings, copia:
- Domain: `tu-tenant.auth0.com`
- Client ID: `...`
- Client Secret: `...`

### Paso 5: Modificar el Código

Crea `server/auth/auth0.ts`:

```typescript
import { Router } from 'express';
import { SignJWT, jwtVerify } from 'jose';

const router = Router();

const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID;
const AUTH0_CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET;
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

// Redirigir a Auth0 para login
router.get('/login', (req, res) => {
  const redirectUri = `${process.env.FRONTEND_URL}/api/oauth/callback`;
  const authUrl = `https://${AUTH0_DOMAIN}/authorize?` +
    `response_type=code&` +
    `client_id=${AUTH0_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `scope=openid profile email`;
  
  res.redirect(authUrl);
});

// Callback de Auth0
router.get('/callback', async (req, res) => {
  const { code } = req.query;
  
  // Intercambiar código por token
  const tokenResponse = await fetch(`https://${AUTH0_DOMAIN}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      client_id: AUTH0_CLIENT_ID,
      client_secret: AUTH0_CLIENT_SECRET,
      code,
      redirect_uri: `${process.env.FRONTEND_URL}/api/oauth/callback`,
    }),
  });
  
  const tokens = await tokenResponse.json();
  
  // Obtener info del usuario
  const userResponse = await fetch(`https://${AUTH0_DOMAIN}/userinfo`, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  
  const userInfo = await userResponse.json();
  
  // Crear/actualizar usuario en tu DB
  // ... (usar tu función upsertUser)
  
  // Crear JWT de sesión
  const sessionToken = await new SignJWT({ 
    sub: userInfo.sub,
    email: userInfo.email,
    name: userInfo.name,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
  
  // Establecer cookie
  res.cookie('session', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
  });
  
  res.redirect('/');
});

export default router;
```

### Variables de Entorno
```env
AUTH0_DOMAIN=tu-tenant.auth0.com
AUTH0_CLIENT_ID=...
AUTH0_CLIENT_SECRET=...
VITE_AUTH0_DOMAIN=tu-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=...
```

---

## Opción 2: Clerk (Más Simple)

Clerk maneja todo el UI de autenticación por ti.

### Paso 1: Crear Cuenta
1. Ve a https://clerk.com
2. Sign up (gratis hasta 10,000 usuarios)

### Paso 2: Crear Application
1. Create application
2. Selecciona métodos de login (Email, Google, etc.)

### Paso 3: Instalar SDK
```bash
pnpm add @clerk/clerk-react @clerk/express
```

### Paso 4: Configurar Frontend
```tsx
// main.tsx
import { ClerkProvider } from '@clerk/clerk-react';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

<ClerkProvider publishableKey={clerkPubKey}>
  <App />
</ClerkProvider>
```

### Paso 5: Configurar Backend
```typescript
// server/index.ts
import { clerkMiddleware } from '@clerk/express';

app.use(clerkMiddleware());
```

### Variables de Entorno
```env
CLERK_SECRET_KEY=sk_test_...
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

---

## Opción 3: Implementación Propia (Email/Password)

Si prefieres control total, puedes implementar auth propio.

### Paso 1: Agregar campos a la DB

```typescript
// drizzle/schema.ts
export const users = mysqlTable("users", {
  // ... campos existentes
  passwordHash: varchar("passwordHash", { length: 255 }),
  emailVerified: boolean("emailVerified").default(false),
  verificationToken: varchar("verificationToken", { length: 64 }),
});
```

### Paso 2: Instalar bcrypt
```bash
pnpm add bcrypt
pnpm add -D @types/bcrypt
```

### Paso 3: Crear rutas de auth

```typescript
// server/auth/local.ts
import bcrypt from 'bcrypt';
import { SignJWT } from 'jose';

// Registro
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  
  // Verificar si el email ya existe
  const existing = await getUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: 'Email already registered' });
  }
  
  // Hash de la contraseña
  const passwordHash = await bcrypt.hash(password, 12);
  
  // Crear usuario
  const user = await createUser({
    email,
    passwordHash,
    name,
  });
  
  // Enviar email de verificación (opcional)
  // await sendVerificationEmail(email, verificationToken);
  
  res.json({ success: true });
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  const user = await getUserByEmail(email);
  if (!user || !user.passwordHash) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // Crear JWT
  const token = await new SignJWT({ sub: user.id })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
  
  res.cookie('session', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
  });
  
  res.json({ success: true, user });
});
```

### Consideraciones de Seguridad
- Usa bcrypt con cost factor de 12+
- Implementa rate limiting
- Agrega verificación de email
- Considera 2FA para cuentas importantes

---

## Opción 4: Firebase Auth

Si ya usas Firebase para otras cosas.

### Paso 1: Crear Proyecto Firebase
1. Ve a https://console.firebase.google.com
2. Crear proyecto

### Paso 2: Habilitar Authentication
1. Build → Authentication
2. Get started
3. Habilita Email/Password y otros providers

### Paso 3: Instalar SDK
```bash
pnpm add firebase firebase-admin
```

### Paso 4: Configurar
```typescript
// client/src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

---

## Comparación de Opciones

| Opción | Dificultad | Costo | Usuarios Gratis |
|--------|------------|-------|-----------------|
| Auth0 | Media | Gratis hasta 7K | 7,000 |
| Clerk | Fácil | Gratis hasta 10K | 10,000 |
| Propia | Alta | $0 | Ilimitados |
| Firebase | Media | Gratis hasta 50K | 50,000 |

## Recomendación

Para empezar rápido: **Clerk** (más simple)
Para más control: **Auth0** (más features)
Para máximo ahorro: **Implementación propia**
