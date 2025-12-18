# ✅ MVP COMPLETENESS CHECKLIST - CreatorVault

## 🎯 OBJETIVO
Validar que TODOS los features críticos funcionan antes de lanzar

---

## 🔐 MÓDULO 1: AUTENTICACIÓN & SEGURIDAD

### 1.1 Dev Authentication (Temporal)
- [ ] **Login como Creator funciona**
  - Abre `/login`
  - Click "Login as Creator"
  - Redirige a dashboard sin errores
  
- [ ] **Login como Brand funciona**
  - Abre `/login`
  - Click "Login as Brand"
  - Redirige a dashboard sin errores

- [ ] **Cookies persisten**
  - Login exitoso
  - Refresca página
  - NO vuelve a login (sesión activa)

- [ ] **Logout funciona**
  - Click logout
  - Redirige a `/login`
  - NO puede acceder a dashboard

### 1.2 Seguridad
- [ ] **Rutas protegidas**
  - Sin login, `/dashboard` redirige a `/login`
  - Sin login, `/campaigns` redirige a `/login`

- [ ] **CORS configurado**
  - Frontend puede llamar APIs
  - No hay errores de CORS en consola

---

## 👤 MÓDULO 2: ONBOARDING

### 2.1 Creator Onboarding
- [ ] **Página de onboarding existe**
  - Ruta: `/onboarding/creator`
  - Formulario visible

- [ ] **Campos obligatorios:**
  - [ ] Bio (textarea)
  - [ ] Nicho (dropdown: fitness, tech, beauty, gaming, etc)
  - [ ] Categorías (multiselect)

- [ ] **Validación funciona**
  - Campo vacío muestra error
  - No puede submit sin completar

- [ ] **Submit crea perfil**
  - Completa form → Submit
  - Redirige a `/dashboard`
  - Perfil guardado en DB

### 2.2 Brand Onboarding
- [ ] **Página de onboarding existe**
  - Ruta: `/onboarding/brand`
  - Formulario visible

- [ ] **Campos obligatorios:**
  - [ ] Company name
  - [ ] Industry
  - [ ] Website

- [ ] **Submit crea perfil**
  - Completa form → Submit
  - Redirige a `/brand/dashboard`
  - Perfil guardado en DB

---

## 📊 MÓDULO 3: CREATOR DASHBOARD

### 3.1 Vista Principal
- [ ] **Dashboard carga sin errores**
  - Navega a `/dashboard`
  - No hay errores en consola
  - Datos se muestran

### 3.2 Datos Mostrados
- [ ] **Earnings este mes**
  - Muestra número (puede ser $0)
  - Formato: $X,XXX

- [ ] **Próximo pago**
  - Muestra fecha
  - Formato: "1 de Febrero"

- [ ] **Guaranteed income**
  - Muestra tier y monto
  - Ej: "Tier 2 - $1,000/mes"

### 3.3 Active Sponsorships
- [ ] **Lista de sponsorships activos**
  - Muestra campañas aplicadas
  - Estado (pending, active, completed)

- [ ] **Sin sponsorships muestra estado vacío**
  - Mensaje: "No active sponsorships"
  - CTA: "Browse Marketplace"

---

## 🏢 MÓDULO 4: BRAND DASHBOARD

### 4.1 Vista Principal
- [ ] **Dashboard carga**
  - Ruta: `/brand/dashboard`
  - Sin errores

### 4.2 Datos Mostrados
- [ ] **Total campaigns**
- [ ] **Active creators**
- [ ] **Total spend**

### 4.3 Actions
- [ ] **Botón "Create Campaign" funciona**
  - Redirige a `/campaign/create`

---

## 🛒 MÓDULO 5: MARKETPLACE

### 5.1 Página Carga
- [ ] **Marketplace accesible**
  - Ruta: `/marketplace`
  - Lista de campaigns visible

### 5.2 Filtros
- [ ] **Filtro por nicho funciona**
  - Dropdown con opciones
  - Filtra results

- [ ] **Búsqueda funciona**
  - Input de search
  - Filtra por keyword

### 5.3 Campaign Cards
- [ ] **Muestra info clave:**
  - [ ] Título
  - [ ] Presupuesto
  - [ ] Payment por creator
  - [ ] Deadline
  - [ ] Botón "Apply"

---

## 📝 MÓDULO 6: CREATE CAMPAIGN (Brand)

### 6.1 Formulario
- [ ] **Página carga**
  - Ruta: `/campaign/create`

- [ ] **Campos presentes:**
  - [ ] Title
  - [ ] Description
  - [ ] Budget
  - [ ] Number of creators
  - [ ] Requirements (followers, engagement)
  - [ ] Deliverables
  - [ ] Start/End dates

### 6.2 Validación
- [ ] **Budget > 0**
- [ ] **Creators > 0**
- [ ] **Fechas válidas**

### 6.3 Submit
- [ ] **Crea campaign**
  - Submit form
  - Redirige a `/campaign/:id`
  - Campaign visible

- [ ] **Payment breakdown correcto**
  - Budget $50K, 50 creators = $1K/creator
  - Muestra matemática

---

## 📋 MÓDULO 7: CAMPAIGN DETAIL

### 7.1 Vista Creator
- [ ] **Detalles visibles:**
  - [ ] Descripción
  - [ ] Requirements
  - [ ] Payment amount
  - [ ] Deadline

- [ ] **Botón "Apply" funciona**
  - Click Apply
  - Muestra confirmación
  - Application guardada en DB

### 7.2 Vista Brand
- [ ] **Ver applicants**
  - Lista de creators que aplicaron
  - Datos: nombre, followers, engagement

- [ ] **Aprobar creator funciona**
  - Click "Approve"
  - Estado cambia a "approved"

- [ ] **Rechazar creator funciona**
  - Click "Reject"
  - Estado cambia a "rejected"

- [ ] **Botón "Activate Campaign"**
  - Solo visible si estado = draft
  - Click → Cambia a "active"

---

## 📄 MÓDULO 8: CONTRACTS

### 8.1 Contract Generation
- [ ] **Se crea automáticamente**
  - Brand aprueba creator
  - Contract se genera
  - Visible en `/contracts`

### 8.2 Contract Details
- [ ] **Muestra términos:**
  - [ ] Parties (Brand + Creator)
  - [ ] Payment amount
  - [ ] Deliverables
  - [ ] Deadline

### 8.3 Firma Digital
- [ ] **Creator puede firmar**
  - Botón "Sign Contract"
  - Pide confirmación
  - Estado → "signed"

- [ ] **Brand puede firmar**
  - (O auto-firma al aprobar)

---

## 📦 MÓDULO 9: DELIVERABLES

### 9.1 Submit Deliverable (Creator)
- [ ] **Form accesible**
  - En campaign detail
  - Botón "Submit Deliverable"

- [ ] **Campos:**
  - [ ] URL del contenido
  - [ ] Descripción
  - [ ] Screenshot (opcional)

- [ ] **Submit funciona**
  - Guarda en DB
  - Notifica a brand

### 9.2 Review Deliverable (Brand)
- [ ] **Ver deliverable**
  - Lista de submissions
  - Ver URL, descripción

- [ ] **Aprobar funciona**
  - Click "Approve"
  - Estado → approved

- [ ] **Rechazar funciona**
  - Click "Reject"
  - Pide razón
  - Estado → rejected

---

## 💰 MÓDULO 10: PAYMENTS & ESCROW

### 10.1 Deposit (Brand)
- [ ] **Botón "Deposit" visible**
  - En campaign detail
  - Solo si estado = draft

- [ ] **Stripe checkout funciona**
  - Click Deposit
  - Abre modal de Stripe
  - Acepta tarjeta de prueba

- [ ] **Confirma pago**
  - Pago exitoso
  - Estado → "funded"
  - Dinero en escrow

### 10.2 Payout (Creator)
- [ ] **Libera pago automáticamente**
  - Brand aprueba deliverable
  - Sistema calcula payout
  - Registra en DB

- [ ] **Historial de pagos**
  - Ruta: `/payments`
  - Lista de pagos recibidos

---

## 📈 MÓDULO 11: ANALYTICS

### 11.1 Creator Analytics
- [ ] **Stats visibles en dashboard:**
  - [ ] Total earned
  - [ ] Campaigns completed
  - [ ] Average rating

### 11.2 Brand Analytics
- [ ] **Campaign performance:**
  - [ ] Total creators
  - [ ] Total spend
  - [ ] Deliverables submitted

---

## 🔔 MÓDULO 12: NOTIFICATIONS

### 12.1 In-App Notifications
- [ ] **Bell icon en navbar**
- [ ] **Badge con count**

### 12.2 Email Notifications
- [ ] **Envía email al aplicar a campaign**
- [ ] **Envía email al aprobar application**
- [ ] **Envía email al completar pago**

---

## 🛠️ MÓDULO 13: INFRAESTRUCTURA

### 13.1 Database
- [ ] **Conexión exitosa**
  - Backend conecta a MySQL
  - Sin errores en logs

- [ ] **Migraciones aplicadas**
  - Todas las tablas existen
  - Schema correcto

### 13.2 APIs
- [ ] **tRPC endpoints funcionan:**
  - [ ] `auth.me` → 200
  - [ ] `creator.getProfile` → 200 o 404
  - [ ] `campaign.getAll` → 200
  - [ ] `application.create` → 200

### 13.3 Deployment
- [ ] **Railway backend online**
  - URL responde
  - Health check: `/api/health` → 200

- [ ] **Frontend deployado**
  - Vercel/Railway URL carga
  - Assets se sirven correctamente

### 13.4 Environment Variables
- [ ] **DATABASE_URL** configurado
- [ ] **JWT_SECRET** configurado
- [ ] **STRIPE_SECRET_KEY** configurado
- [ ] **FRONTEND_URL** configurado

---

## 🧪 MÓDULO 14: TESTING (Manual)

### 14.1 Flujo Creator Completo
1. [ ] Login como creator
2. [ ] Completar onboarding
3. [ ] Ver marketplace
4. [ ] Aplicar a campaign
5. [ ] Ver application en dashboard
6. [ ] (Esperar aprobación)
7. [ ] Submit deliverable
8. [ ] Ver pago en historial

### 14.2 Flujo Brand Completo
1. [ ] Login como brand
2. [ ] Completar onboarding
3. [ ] Crear campaign
4. [ ] Depositar escrow (Stripe test)
5. [ ] Activar campaign
6. [ ] Ver applicants
7. [ ] Aprobar creators
8. [ ] Ver deliverables
9. [ ] Aprobar deliverables
10. [ ] Ver analytics

### 14.3 Edge Cases
- [ ] **Campaign sin applicants**
  - Muestra estado vacío
  
- [ ] **Creator sin profile completo**
  - Redirige a onboarding

- [ ] **Brand sin campaigns**
  - Dashboard muestra CTA

---

## 🚨 MÓDULO 15: ERROR HANDLING

### 15.1 Network Errors
- [ ] **API falla**
  - Muestra toast/mensaje de error
  - No crashea la app

### 15.2 Validation Errors
- [ ] **Form validation**
  - Muestra errores en rojo
  - Previene submit

### 15.3 Console Errors
- [ ] **Cero errores críticos**
  - Abre DevTools
  - No hay errores rojos (solo warnings ok)

---

## ✅ CHECKLIST DE ACEPTACIÓN FINAL

Para considerar MVP completo:

- [ ] **100% de Módulo 1** (Auth)
- [ ] **100% de Módulo 2** (Onboarding)
- [ ] **80%+ de Módulos 3-7** (Dashboards & Campaigns)
- [ ] **70%+ de Módulos 8-10** (Contracts & Payments)
- [ ] **50%+ de Módulos 11-12** (Analytics & Notifs)
- [ ] **100% de Módulo 13** (Infra)
- [ ] **90%+ de Módulos 14-15** (Testing & Errors)

**Mínimo para lanzar:** 85% total completado

---

## 📝 PRÓXIMO PASO

1. **Validar checklist con código** (revisar archivos)
2. **Testing manual** (probar en browser)
3. **Fix bloqueadores** (errores críticos)
4. **Re-validar**
5. **✅ Listo para vender**
