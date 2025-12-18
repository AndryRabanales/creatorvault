# 🧪 GUÍA DE TESTING MANUAL - CreatorVault MVP

## 🎯 OBJETIVO
Probar TODOS los flujos críticos antes de lanzar

---

## ⚙️ PREPARACIÓN

### 1. Abrir DevTools
- Presiona `F12` en Chrome
- Tab "Console" abierta
- Tab "Network" para ver requests

### 2. URLs
- **Frontend:** https://creatorvault-production.up.railway.app
- **Backend:** https://creatorvault-production.up.railway.app/api/health

### 3. Datos de Prueba Stripe
- **Tarjeta:** 4242 4242 4242 4242
- **Fecha:** Cualquier fecha futura (12/25)
- **CVV:** Cualquier 3 dígitos (123)
- **ZIP:** Cualquier 5 dígitos (12345)

---

## ✅ TEST 1: FLUJO CREATOR COMPLETO (15 min)

### Paso 1: Login
1. Ve a `/login`
2. Click "Login as Creator"
3. **✅ Verifica:** Redirige a dashboard O onboarding

### Paso 2: Onboarding (si aplica)
1. Si ves formulario de onboarding:
2. Completa:
   - Bio: "Test creator de fitness"
   - Nicho: Fitness
   - Categorías: Health, Wellness
3. Click "Complete Profile"
4. **✅ Verifica:** Redirige a `/dashboard`
5. **✅ Verifica:** Consola sin errores rojos

### Paso 3: Dashboard
1. Dashboard debería mostrar:
   - Earnings (puede ser $0)
   - Próximo pago
   - Tier (Tier 1, 2, o 3)
2. **✅ Verifica:** Datos visibles
3. **✅ Verifica:** No hay "undefined" o "null" en pantalla

### Paso 4: Marketplace
1. Click "Browse Opportunities" o ve a `/marketplace`
2. **✅ Verifica:** Lista de campaigns carga
3. Si lista vacía: Normal, necesitas crear campaign como brand primero

### Paso 5: Apply a Campaign (si hay campaigns)
1. Click en un campaign
2. Click "Apply"
3. **✅ Verifica:** Toast/mensaje de confirmación
4. **✅ Verifica:** Network tab muestra POST exitoso

---

## ✅ TEST 2: FLUJO BRAND COMPLETO (20 min)

### Paso 1: Login
1. Abre ventana incógnita (Ctrl+Shift+N)
2. Ve a `/login`
3. Click "Login as Brand"
4. **✅ Verifica:** Redirige a dashboard O onboarding

### Paso 2: Onboarding
1. Si ves formulario:
2. Completa:
   - Company: "Test Brand Inc"
   - Industry: "Technology"
   - Website: "https://testbrand.com"
3. Click "Complete Profile"
4. **✅ Verifica:** Redirige a `/brand/dashboard`

### Paso 3: Create Campaign
1. Click "Create Campaign"
2. Completa formulario:
   ```
   Title: Test Campaign - Zapatillas
   Description: Promocionar zapatillas deportivas
   Budget: $1000
   Number of Creators: 10
   Min Followers: 1000
   Min Engagement: 1%
   Deliverables: 1 video de 30 segundos
   Start: Hoy
   End: +30 días
   ```
3. Click "Create Campaign"
4. **✅ Verifica:** Redirige a `/campaign/:id`
5. **✅ Verifica:** Payment breakdown muestra $100/creator

### Paso 4: Deposit (CRÍTICO)
1. En campaign detail, click "Deposit & Activate"
2. **✅ Verifica:** Abre modal de Stripe
3. Ingresa tarjeta de prueba:
   - Número: 4242 4242 4242 4242
   - Fecha: 12/25
   - CVV: 123
   - ZIP: 12345
4. Click "Pay"
5. **✅ CRÍTICO - Verifica:**
   - Modal se cierra
   - Campaign status → "Active" o "Funded"
   - Mensaje de éxito
6. **❌ Si falla:** Anota el error exacto

### Paso 5: View Applicants
1. (Primero, en ventana de creator, aplica a este campaign)
2. En ventana de brand, refresca campaign detail
3. Click "View Applications"
4. **✅ Verifica:** Lista de applicants visible
5. Click "Approve" en un creator
6. **✅ Verifica:** Estado cambia a "approved"

---

## ✅ TEST 3: DELIVERABLES & PAYMENT (15 min)

### Paso 1: Submit Deliverable (Creator)
1. Ventana Creator → Dashboard → Active Sponsorships
2. Click en campaign aprobado
3. Click "Submit Deliverable"
4. Ingresa:
   - URL: https://tiktok.com/@test/video/123
   - Description: "Video promocional completado"
5. Click "Submit"
6. **✅ Verifica:** Mensaje de éxito

### Paso 2: Approve Deliverable (Brand)
1. Ventana Brand → Campaign detail
2. Click "View Deliverables"
3. Ver deliverable submitted
4. Click "Approve"
5. **✅ CRÍTICO - Verifica:**
   - Estado → "approved"
   - Payment se registra

### Paso 3: Verify Payment (Creator)
1. Ventana Creator → Dashboard
2. Check "Earnings this month"
3. **✅ Verifica:** Monto se actualiza
4. Ve a "Payment History" (si existe)
5. **✅ Verifica:** Payment entry visible

---

## ✅ TEST 4: EDGE CASES (10 min)

### Test 4.1: Campaign Sin Applicants
1. Crear campaign
2. NO aplicar como creator
3. **✅ Verifica:** Brand ve "No applicants yet"

### Test 4.2: Network Error
1. Desconecta internet
2. Intenta navegar
3. **✅ Verifica:** Mensaje de error (no pantalla blanca)
4. Reconecta
5. **✅ Verifica:** App se recupera

### Test 4.3: Logout & Re-login
1. Click logout
2. **✅ Verifica:** Redirige a `/login`
3. Login de nuevo
4. **✅ Verifica:** Datos persisten

---

## 📋 CHECKLIST FINAL

### CREATOR FLOW
- [ ] Login funciona
- [ ] Onboarding redirect funciona
- [ ] Dashboard muestra datos
- [ ] Marketplace lista campaigns
- [ ] Apply funciona
- [ ] Submit deliverable funciona
- [ ] Payment history visible

### BRAND FLOW
- [ ] Login funciona
- [ ] Onboarding redirect funciona
- [ ] Create campaign funciona
- [ ] **Stripe deposit funciona** ← CRÍTICO
- [ ] View applicants funciona
- [ ] Approve funciona
- [ ] View deliverables funciona
- [ ] Approve deliverable funciona

### CRITICAL PATHS
- [ ] **Payment flow end-to-end** ← MÁS CRÍTICO
- [ ] Onboarding redirects
- [ ] Console sin errores críticos

---

## 🚨 SI ALGO FALLA

### Reporta:
1. **Qué hiciste** (paso exacto)
2. **Qué esperabas** (resultado correcto)
3. **Qué pasó** (error actual)
4. **Error en consola** (screenshot de DevTools)

### Errores Comunes:
- **"Network Error"** → Backend caído, verifica Railway
- **"Unauthorized"** → Sesión expirada, logout y login
- **Pantalla blanca** → Error de JS, revisa consola
- **Stripe falla** → Env var missing, verifica `STRIPE_PUBLISHABLE_KEY`

---

## ✅ CRITERIO DE ÉXITO

**Para considerar MVP listo:**
- Mínimo 90% de checklist pasando
- **Payment flow funcionando al 100%**
- Cero errores críticos en consola

**Si logras esto:** ¡LISTO PARA VENDER! 🚀
