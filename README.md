# Oasis

MVP para gestionar clientes, planes recurrentes, cobros automáticos y recordatorios. Cada workspace conecta su propia cuenta de Mercado Pago; Oasis consulta y refleja el pago, pero nunca recibe el dinero.

## Stack

- Next.js 15, React 19 y Tailwind CSS
- Clerk con Google
- MySQL y Drizzle ORM
- Mercado Pago mediante OAuth, Checkout Pro y Webhooks
- Resend opcional para recordatorios por email

## Desarrollo local

Requiere Node 20.19 o superior (se recomienda Node 22) y MySQL.

```bash
cp .env.example .env.local
npm install
npm run db:create
npm run db:migrate
npm run db:seed
npm run dev
```

El acceso local también usa Clerk; no existe un bypass de autenticación.

## Autenticación

Crear credenciales OAuth en Google Cloud y configurar:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
OASIS_APP_SECRET=un-secreto-largo-y-aleatorio
```

Callback autorizado de Google:

```text
Configurar Google como proveedor social dentro del dashboard de Clerk. Clerk gestiona el callback de OAuth.
```

El rol de plataforma `SUPER_ADMIN` se administra en el `privateMetadata` del usuario en Clerk (`{ "platformRole": "SUPER_ADMIN" }`). Esos usuarios pueden abrir `/console` y entrar temporalmente a cualquier workspace. El acceso queda limitado por una cookie HttpOnly de cuatro horas y las mutaciones relevantes se registran en `audit_logs`.

## Mercado Pago

Crear una aplicación de Mercado Pago para Oasis y configurar:

```env
MERCADO_PAGO_CLIENT_ID=
MERCADO_PAGO_CLIENT_SECRET=
MERCADO_PAGO_REDIRECT_URI=https://tu-dominio.com/api/payments/mercadopago/callback
MERCADO_PAGO_WEBHOOK_SECRET=
PAYMENT_TOKEN_ENCRYPTION_KEY=otro-secreto-largo-y-aleatorio
```

Registrar como redirect URI exactamente la URL anterior. En Webhooks activar el tópico `payment` y usar:

```text
https://tu-dominio.com/api/payments/mercadopago/webhook
```

Oasis agrega a cada preferencia una URL específica por workspace, firmada para impedir que el `organizationId` pueda ser alterado en un webhook. Además, valida que el `collector_id` del pago coincida con la cuenta Mercado Pago conectada. Los access/refresh tokens se guardan cifrados con AES-256-GCM.

### Sandbox de Mercado Pago

Para probar Checkout Pro sin OAuth ni dinero real, copiar desde **Credenciales de prueba** el Access Token y User ID de la cuenta vendedor:

```env
MERCADO_PAGO_SANDBOX_ACCESS_TOKEN=
MERCADO_PAGO_SANDBOX_USER_ID=
MERCADO_PAGO_SANDBOX_ENABLED=true
```

En desarrollo, Preferencias mostrará **Usar sandbox**. Esta conexión emplea el vendedor ficticio creado por Mercado Pago y queda marcada como `SANDBOX`; puede reemplazarse luego por OAuth productivo. El sandbox configurado por variables es una cuenta de prueba fija para desarrollo, no una conexión OAuth independiente por workspace.

El callback y el webhook deben estar expuestos mediante una URL HTTPS pública. Si se usa un túnel de desarrollo, su acceso debe permitir visitantes anónimos: un túnel que responda `401` antes de llegar a Next.js no puede recibir redirecciones ni notificaciones de Mercado Pago.

## Automatización diaria

Configurar `CRON_SECRET` y ejecutar al menos una vez por día:

```bash
curl -X POST https://tu-dominio.com/api/cron/billing-periods \
  -H "Authorization: Bearer $CRON_SECRET"
```

El proceso:

1. Genera períodos hasta 35 días hacia adelante.
2. Marca cobros vencidos.
3. Crea links de Mercado Pago que falten.
4. Agenda y entrega recordatorios idempotentes.

Para email configurar `RESEND_API_KEY` y `RESEND_FROM_EMAIL`. Sin esas variables los recordatorios quedan agendados, pero no se envían.

## Deploy

La base remota puede ser cualquier MySQL compatible. En cada despliegue ejecutar:

```bash
npm run db:migrate
npm run build
npm run start
```

En producción usar HTTPS, secretos diferentes a los locales y Node 20.19+.

## Comandos útiles

```bash
npm run typecheck
npm run build
npm run db:generate
npm run db:migrate
npm run db:seed
```
