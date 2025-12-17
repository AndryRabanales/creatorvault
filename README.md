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

### Prerequisites
- Node.js 18+
- pnpm (`npm install -g pnpm`)
- Database (MySQL/PostgreSQL)

### Installation

```bash
# Clone repository
git clone https://github.com/TU_USUARIO/creatorvault.git
cd creatorvault

# Install dependencies
pnpm install

# Configure environment variables
cp .env.example .env
# Edit .env with your credentials (see docs/ENV_VARIABLES.md)

# Run database migrations
pnpm db:push

# Validate configuration
pnpm validate

# Start development server
pnpm dev
```

**📖 For detailed setup instructions, see [Quick Start Guide](docs/QUICK_START.md)**

### Available Scripts

```bash
pnpm dev           # Development with hot reload
pnpm build         # Build for production
pnpm start         # Start production server
pnpm test          # Run tests
pnpm check         # TypeScript type checking
pnpm validate      # Validate environment variables
pnpm verify:routes # Verify route configuration
pnpm health        # Check server health
pnpm db:push       # Run database migrations
pnpm db:test       # Test database connection
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

## 📚 Documentation

- **[Quick Start Guide](docs/QUICK_START.md)** - Get started in 5 minutes
- **[Environment Variables](docs/ENV_VARIABLES.md)** - Complete environment configuration guide
- **[Deployment Guide](DEPLOYMENT_GUIDE.md)** - Deploy to production
- **[Deployment Checklist](DEPLOYMENT_CHECKLIST.md)** - Pre-deployment verification
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues and solutions

## 🔧 Configuration

See [docs/ENV_VARIABLES.md](docs/ENV_VARIABLES.md) for all environment variables.

### Quick Configuration Check

```bash
# Validate your environment setup
pnpm validate

# Check server health
pnpm health

# Verify routes
pnpm verify:routes
```

## 📖 Deployment

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for complete deployment instructions.

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

## 🆘 Need Help?

- **Having Issues?** Check the [Troubleshooting Guide](docs/TROUBLESHOOTING.md)
- **Deployment Problems?** See [Deployment Checklist](DEPLOYMENT_CHECKLIST.md)
- **Configuration Questions?** Read [Environment Variables Guide](docs/ENV_VARIABLES.md)
- **Getting Started?** Follow the [Quick Start Guide](docs/QUICK_START.md)

## 📞 Support

- 📧 Email: soporte@creatorvault.com
- 📖 Documentation: [docs/](docs/)
- 🐛 Issues: [GitHub Issues](https://github.com/TU_USUARIO/creatorvault/issues)

## ✅ Pre-Deployment Validation

Before deploying, run these checks:

```bash
pnpm check          # TypeScript compilation
pnpm validate       # Environment variables
pnpm verify:routes  # Route configuration
pnpm build          # Production build test
```

---

Made with ❤️ for creators and brands
