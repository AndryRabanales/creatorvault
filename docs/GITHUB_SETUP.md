# Guía Rápida: Subir CreatorVault a GitHub

## Paso 1: Crear Repositorio en GitHub

1. Ve a https://github.com/new
2. Nombre del repositorio: `creatorvault`
3. Descripción: "Plataforma de patrocinios para creadores de contenido"
4. Visibilidad: Privado (recomendado) o Público
5. **NO** inicialices con README, .gitignore o licencia
6. Click en "Create repository"

## Paso 2: Subir el Código

Abre tu terminal y ejecuta estos comandos:

```bash
# 1. Navega a la carpeta del proyecto
cd creatorvault

# 2. Inicializa Git (si no está inicializado)
git init

# 3. Agrega todos los archivos
git add .

# 4. Crea el primer commit
git commit -m "🚀 CreatorVault MVP - Initial commit"

# 5. Renombra la rama principal a 'main'
git branch -M main

# 6. Conecta con tu repositorio de GitHub
# IMPORTANTE: Reemplaza TU_USUARIO con tu nombre de usuario de GitHub
git remote add origin https://github.com/TU_USUARIO/creatorvault.git

# 7. Sube el código
git push -u origin main
```

## Paso 3: Verificar

1. Ve a `https://github.com/TU_USUARIO/creatorvault`
2. Deberías ver todos los archivos del proyecto

## Comandos Útiles para el Futuro

```bash
# Ver estado de cambios
git status

# Agregar todos los cambios
git add .

# Crear un commit
git commit -m "Descripción del cambio"

# Subir cambios
git push

# Descargar cambios (si trabajas desde otra computadora)
git pull
```

## Proteger Información Sensible

El archivo `.gitignore` ya está configurado para ignorar:
- `.env` (variables de entorno)
- `node_modules/` (dependencias)
- Archivos de build

**NUNCA** subas archivos `.env` con credenciales reales.

## Conectar con Railway/Vercel

Una vez que tu código esté en GitHub:

### Railway
1. Ve a https://railway.app
2. "New Project" → "Deploy from GitHub repo"
3. Autoriza Railway para acceder a tu GitHub
4. Selecciona `creatorvault`
5. Railway detectará automáticamente la configuración

### Vercel
1. Ve a https://vercel.com
2. "Add New" → "Project"
3. "Import Git Repository"
4. Selecciona `creatorvault`
5. Vercel detectará que es un proyecto Vite
