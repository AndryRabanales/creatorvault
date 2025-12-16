# Configuración de Base de Datos para CreatorVault

## Opción 1: Neon (Recomendado - Gratis)

Neon ofrece PostgreSQL serverless con un tier gratuito generoso.

### Paso 1: Crear Cuenta
1. Ve a https://neon.tech
2. Click en "Sign Up"
3. Puedes usar GitHub, Google o email

### Paso 2: Crear Proyecto
1. Click en "Create Project"
2. Nombre: `creatorvault`
3. Región: Selecciona la más cercana a tu hosting
4. Click en "Create Project"

### Paso 3: Obtener Connection String
1. En el dashboard, ve a "Connection Details"
2. Selecciona "Connection string"
3. Copia el string completo:
```
postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
```

### Paso 4: Configurar en tu App
```env
DATABASE_URL=postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
```

### Límites del Tier Gratuito
- 0.5 GB de almacenamiento
- 1 proyecto
- Compute ilimitado (con auto-suspend)
- Branching incluido

---

## Opción 2: PlanetScale (MySQL - Gratis)

PlanetScale ofrece MySQL serverless con branching.

### Paso 1: Crear Cuenta
1. Ve a https://planetscale.com
2. Sign up con GitHub

### Paso 2: Crear Database
1. Click en "Create database"
2. Nombre: `creatorvault`
3. Región: Selecciona la más cercana
4. Plan: Hobby (gratis)

### Paso 3: Obtener Credenciales
1. Ve a Settings → Passwords
2. Click en "New password"
3. Nombre: `production`
4. Copia las credenciales

### Paso 4: Connection String
```
mysql://user:password@aws.connect.psdb.cloud/creatorvault?ssl={"rejectUnauthorized":true}
```

### Límites del Tier Gratuito
- 5 GB de almacenamiento
- 1 billion row reads/mes
- 10 million row writes/mes

---

## Opción 3: Railway (Simple)

Railway te permite crear una base de datos con un click.

### Paso 1: Crear Proyecto
1. Ve a https://railway.app
2. "New Project"
3. "Provision MySQL" o "Provision PostgreSQL"

### Paso 2: Obtener Credenciales
1. Click en el servicio de base de datos
2. Ve a "Variables"
3. Copia `DATABASE_URL`

### Costo
- $5 de crédito gratis al mes
- Después: ~$5-10/mes según uso

---

## Opción 4: Supabase (PostgreSQL + Auth)

Supabase ofrece PostgreSQL con muchas features adicionales.

### Paso 1: Crear Cuenta
1. Ve a https://supabase.com
2. Sign up con GitHub

### Paso 2: Crear Proyecto
1. "New Project"
2. Nombre: `creatorvault`
3. Genera una contraseña segura
4. Selecciona región

### Paso 3: Obtener Connection String
1. Ve a Settings → Database
2. Copia "Connection string (URI)"

### Límites del Tier Gratuito
- 500 MB de base de datos
- 1 GB de almacenamiento de archivos
- 50,000 usuarios activos mensuales

---

## Migrar el Esquema

Una vez que tengas tu `DATABASE_URL`, ejecuta:

```bash
# En tu terminal local
cd creatorvault

# Configura la variable de entorno
export DATABASE_URL="tu_connection_string_aqui"

# Ejecuta las migraciones
pnpm db:push
```

Esto creará todas las tablas necesarias:
- `users` - Usuarios del sistema
- `creatorProfiles` - Perfiles de creadores
- `brandProfiles` - Perfiles de marcas
- `campaigns` - Campañas de patrocinio
- `applications` - Aplicaciones a campañas
- `contracts` - Contratos digitales
- `deliverables` - Entregables
- `payments` - Historial de pagos
- `messages` - Mensajes
- `conversations` - Conversaciones
- `reviews` - Reviews y ratings
- `notifications` - Notificaciones
- `socialAccounts` - Cuentas de redes sociales

## Verificar Conexión

```bash
# Probar conexión
pnpm db:push

# Si ves "Done!" la conexión funciona
```

## Backups

### Neon
- Backups automáticos incluidos
- Point-in-time recovery disponible

### PlanetScale
- Backups automáticos diarios
- Branching para desarrollo seguro

### Railway
- Configura backups manuales
- Usa `pg_dump` o `mysqldump`

## Seguridad

1. **Nunca** compartas tu DATABASE_URL públicamente
2. Usa SSL siempre (`?sslmode=require`)
3. Crea usuarios con permisos limitados para producción
4. Habilita IP allowlisting si está disponible
