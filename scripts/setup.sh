#!/bin/bash

# ============================================
# CreatorVault - Script de Setup
# ============================================

echo "🚀 CreatorVault Setup Script"
echo "============================"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar Node.js
echo "📦 Verificando Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓ Node.js instalado: $NODE_VERSION${NC}"
else
    echo -e "${RED}✗ Node.js no encontrado. Por favor instala Node.js 18+${NC}"
    echo "  Descarga de: https://nodejs.org"
    exit 1
fi

# Verificar pnpm
echo "📦 Verificando pnpm..."
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm -v)
    echo -e "${GREEN}✓ pnpm instalado: $PNPM_VERSION${NC}"
else
    echo -e "${YELLOW}⚠ pnpm no encontrado. Instalando...${NC}"
    npm install -g pnpm
fi

# Instalar dependencias
echo ""
echo "📦 Instalando dependencias..."
pnpm install

# Verificar archivo .env
echo ""
echo "🔐 Verificando configuración..."
if [ -f ".env" ]; then
    echo -e "${GREEN}✓ Archivo .env encontrado${NC}"
else
    echo -e "${YELLOW}⚠ Archivo .env no encontrado${NC}"
    echo "  Por favor crea un archivo .env con las variables necesarias"
    echo "  Consulta docs/ENV_VARIABLES.md para más información"
fi

# Verificar DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo -e "${YELLOW}⚠ DATABASE_URL no configurada${NC}"
    echo "  Necesitas configurar la conexión a la base de datos"
else
    echo -e "${GREEN}✓ DATABASE_URL configurada${NC}"
fi

# Migrar base de datos
echo ""
echo "🗄️ ¿Deseas ejecutar las migraciones de base de datos? (y/n)"
read -r MIGRATE
if [ "$MIGRATE" = "y" ] || [ "$MIGRATE" = "Y" ]; then
    echo "Ejecutando migraciones..."
    pnpm db:push
    echo -e "${GREEN}✓ Migraciones completadas${NC}"
fi

# Resumen
echo ""
echo "============================"
echo "📋 Resumen de Setup"
echo "============================"
echo ""
echo "Próximos pasos:"
echo "1. Configura las variables de entorno en .env"
echo "2. Ejecuta 'pnpm db:push' para migrar la base de datos"
echo "3. Ejecuta 'pnpm dev' para iniciar en modo desarrollo"
echo "4. Ejecuta 'pnpm build && pnpm start' para producción"
echo ""
echo -e "${GREEN}¡Setup completado!${NC}"
