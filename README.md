# CreatorVault 🚀

Plataforma de patrocinios que conecta creadores de contenido con marcas, con pagos garantizados y contratos digitales.

![CreatorVault](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Características

### Para Creadores
- 💰 **Ingresos Garantizados** - $500-$2000/mes según tu audiencia
- 📊 **Sistema de Tiers** - Tier 1 (10k-50k), Tier 2 (50k-200k), Tier 3 (200k+)
- 🎯 **Marketplace de Campañas** - Encuentra oportunidades de patrocinio
- 📝 **Contratos Digitales** - Firma electrónica con validez legal
- 💬 **Mensajería Directa** - Comunícate con las marcas
- ⭐ **Sistema de Reviews** - Construye tu reputación

### Para Marcas
- 🎨 **Crear Campañas** - Define presupuesto, requisitos y deadline
- 👥 **Gestionar Aplicaciones** - Revisa y aprueba creadores
- 📋 **Contratos Automáticos** - Generados al aprobar creadores
- 💳 **Pagos Seguros** - Escrow con Stripe
- 📈 **Analytics** - Métricas de rendimiento

### Plataforma
- 🔐 **Autenticación Segura** - Roles (Creator/Brand/Admin)
- 💳 **Stripe Integration** - Pagos reales con escrow
- 📱 **Responsive Design** - Funciona en móvil y desktop
- 🎨 **UI Moderna** - Inspirada en Stripe/Linear

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, TailwindCSS 4, shadcn/ui
- **Backend**: Node.js, Express, tRPC
- **Database**: MySQL/PostgreSQL con Drizzle ORM
- **Payments**: Stripe
- **Auth**: JWT con OAuth

## 🚀 Quick Start

### Requisitos
- Node.js 18+
- pnpm
- Base de datos MySQL/PostgreSQL

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/TU_USUARIO/creatorvault.git
cd creatorvault

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales

# Migrar base de datos
pnpm db:push

# Iniciar en desarrollo
pnpm dev
```

### Scripts Disponibles

```bash
pnpm dev        # Desarrollo con hot reload
pnpm build      # Build para producción
pnpm start      # Iniciar en producción
pnpm test       # Ejecutar tests
pnpm db:push    # Migrar base de datos
```

## 📁 Estructura del Proyecto

```
creatorvault/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes UI
│   │   ├── pages/          # Páginas de la app
│   │   ├── contexts/       # React contexts
│   │   └── lib/            # Utilidades
├── server/                 # Backend Express + tRPC
│   ├── _core/              # Core del servidor
│   ├── stripe/             # Integración Stripe
│   ├── routers.ts          # Rutas tRPC
│   └── db.ts               # Queries de DB
├── drizzle/                # Schema de base de datos
├── docs/                   # Documentación
└── scripts/                # Scripts de utilidad
```

## 💳 Sistema de Tiers

| Tier | Seguidores | Ingreso Garantizado |
|------|------------|---------------------|
| Tier 1 | 10K - 50K | $500/mes |
| Tier 2 | 50K - 200K | $1,000/mes |
| Tier 3 | 200K+ | $2,000/mes |

## 💰 Modelo de Negocio

- **Comisión de plataforma**: 20%
- **Pago al creador**: 80%
- Los fondos se mantienen en escrow hasta la aprobación del entregable

## 🔧 Configuración

Ver [docs/ENV_VARIABLES.md](docs/ENV_VARIABLES.md) para todas las variables de entorno.

## 📖 Deployment

Ver [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) para instrucciones completas de deployment.

### Opciones de Hosting

| Servicio | Tipo | Costo |
|----------|------|-------|
| Neon | Database | Gratis |
| Railway | Backend | $5 gratis |
| Vercel | Frontend | Gratis |

## 🧪 Testing

```bash
# Ejecutar todos los tests
pnpm test

# Tests con coverage
pnpm test -- --coverage
```

## 📝 Licencia

MIT License - ver [LICENSE](LICENSE) para más detalles.

## 🤝 Contribuir

1. Fork el repositorio
2. Crea tu branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

- 📧 Email: soporte@creatorvault.com
- 📖 Docs: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

---

Hecho con ❤️ para creadores y marcas
