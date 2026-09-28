# Arroz con Mango

Landing page para @Alejoelcoach


SvelteKit
    ↓
Cloudflare Workers
    ↓
Drizzle ORM
    ↓
Cloudflare D1

Emails
    ↓
Resend

Pagos
    ↓
Mercado Pago

Archivos
    ↓
Cloudflare R2

Dominio
    ↓
Hostinger (registro)
Cloudflare (DNS)
`

users
├─ id
├─ email
├─ role

patients
├─ id
├─ full_name
├─ email
├─ phone

appointments
├─ id
├─ patient_id
├─ starts_at
├─ ends_at
├─ status

payments
├─ id
├─ appointment_id
├─ mercado_pago_id
├─ amount
├─ status