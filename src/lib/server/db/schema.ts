import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const pacientes = sqliteTable('pacientes', {
    id: integer('id').primaryKey(),
    nombre: text('nombre').notNull(),
    email: text('email').notNull(),
    telefono: text('telefono').notNull()
});

export const citas = sqliteTable('citas', {
	id: integer('id').primaryKey(),
	nombre: text('nombre').notNull(),
	email: text('email').notNull(),
	fecha: text('fecha').notNull(),
	hora: text('hora').notNull(),
	estado: text('estado').notNull()
});

export const pagos = sqliteTable('pagos', {
    id: integer('id').primaryKey(),
    cita_id: integer('cita_id').notNull(),
    mercado_pago_id: text('mercado_pago_id').notNull(),
    amount: integer('amount').notNull(),
    status: text('status').notNull()
});

/*users
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
├─ status*/