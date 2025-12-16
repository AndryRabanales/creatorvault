# Configuración de Stripe para CreatorVault

## Paso 1: Crear Cuenta de Stripe

1. Ve a https://stripe.com
2. Click en "Start now" o "Crear cuenta"
3. Completa el registro con tu email
4. Verifica tu email

## Paso 2: Completar Verificación de Negocio

Para recibir pagos reales, necesitas:
1. Información del negocio (puede ser personal)
2. Información bancaria para recibir pagos
3. Verificación de identidad

**Nota**: Puedes usar el modo test sin completar esto.

## Paso 3: Obtener API Keys

1. Ve a https://dashboard.stripe.com/apikeys
2. Verás dos tipos de claves:

### Claves de Test (para desarrollo)
```
Publishable key: pk_test_...
Secret key: sk_test_...
```

### Claves de Producción (para dinero real)
```
Publishable key: pk_live_...
Secret key: sk_live_...
```

**IMPORTANTE**: Nunca compartas tu Secret Key públicamente.

## Paso 4: Configurar Webhooks

Los webhooks permiten que Stripe notifique a tu app cuando ocurren eventos (pagos, reembolsos, etc.)

1. Ve a https://dashboard.stripe.com/webhooks
2. Click en "Add endpoint"
3. Configura:
   - **Endpoint URL**: `https://tu-dominio.com/api/stripe/webhook`
   - **Eventos a escuchar**:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `checkout.session.completed`
     - `checkout.session.expired`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`

4. Click en "Add endpoint"
5. Copia el **Signing secret** (empieza con `whsec_...`)

## Paso 5: Configurar Variables de Entorno

Agrega estas variables a tu hosting:

```env
# Backend
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Frontend
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Paso 6: Probar Pagos

### Tarjetas de Prueba

Usa estas tarjetas en modo test:

| Número | Resultado |
|--------|-----------|
| 4242 4242 4242 4242 | Pago exitoso |
| 4000 0000 0000 0002 | Tarjeta rechazada |
| 4000 0000 0000 9995 | Fondos insuficientes |

- **Fecha de expiración**: Cualquier fecha futura (ej: 12/34)
- **CVC**: Cualquier 3 dígitos (ej: 123)
- **ZIP**: Cualquier 5 dígitos (ej: 12345)

### Verificar Webhook

1. Haz un pago de prueba
2. Ve a https://dashboard.stripe.com/webhooks
3. Click en tu endpoint
4. Verifica que los eventos se recibieron correctamente

## Paso 7: Pasar a Producción

Cuando estés listo para recibir pagos reales:

1. Completa la verificación de negocio en Stripe
2. Cambia las claves de test por las de producción:
   - `pk_test_...` → `pk_live_...`
   - `sk_test_...` → `sk_live_...`
3. Actualiza el webhook URL si es necesario
4. Crea un nuevo webhook secret para producción

## Comisiones de Stripe

- **Por transacción**: 2.9% + $0.30 USD
- **Sin cuota mensual**
- **Sin costos de setup**

Ejemplo: Si un brand paga $1000 por una campaña:
- Stripe cobra: $29 + $0.30 = $29.30
- Tú recibes: $970.70
- De eso, 20% plataforma ($194.14) y 80% creador ($776.56)

## Solución de Problemas

### "No such payment_intent"
- Verifica que estés usando las claves correctas (test vs live)

### "Webhook signature verification failed"
- Verifica que el STRIPE_WEBHOOK_SECRET sea correcto
- Asegúrate de usar el raw body en el webhook handler

### "Card was declined"
- En modo test, usa las tarjetas de prueba listadas arriba
- En producción, el cliente debe usar una tarjeta válida

## Recursos

- Documentación: https://stripe.com/docs
- Dashboard: https://dashboard.stripe.com
- Soporte: https://support.stripe.com
