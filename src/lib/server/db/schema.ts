import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import type { EstadoCita, EstadoPago } from '$lib/types/agenda';

// 1. NUEVA TABLA: Catálogo configurable desde tu Dashboard
export const tiposCita = sqliteTable('tipos_cita', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	nombre: text('nombre').notNull(), // Ej: 'Mentoría 1 a 1'
	descripcion: text('descripcion'),
	duracionFranjas: integer('duracion_franjas').notNull().default(1), // Cuántos bloques consume
	precio: integer('precio').notNull(), // Precio en tu moneda
	activo: integer('activo', { mode: 'boolean' }).notNull().default(true)
});

// 2. PACIENTES: Con email único para poder hacer upsert si vuelven a agendar
export const pacientes = sqliteTable('pacientes', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	nombre: text('nombre').notNull(),
	email: text('email').notNull().unique(),
	telefono: text('telefono').notNull()
});

// 3. CITAS: Conectada con pacientes y tiposCita + timestamp automático
export const citas = sqliteTable('citas', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	pacienteId: text('paciente_id')
		.notNull()
		.references(() => pacientes.id),
	tipoCitaId: text('tipo_cita_id')
		.notNull()
		.references(() => tiposCita.id),

	estadoCita: text('estado_cita').$type<EstadoCita>().notNull().default('pendiente'),
	estadoPago: text('estado_pago').$type<EstadoPago>().notNull().default('pendiente'),

	notasCliente: text('notas_cliente'),
	creadoEn: integer('creado_en', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});

// 4. PAGOS: Apunta a la cita (permite registrar múltiples intentos de MP si uno falla)
export const pagos = sqliteTable('pagos', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	citaId: text('cita_id')
		.notNull()
		.references(() => citas.id),
	mercadoPagoId: text('mercado_pago_id').notNull().unique(), // ID de transacción de MP
	amount: integer('amount').notNull(),
	status: text('status').notNull(),
	creadoEn: integer('creado_en', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});

// 5. FRANJAS: Incluye lockedUntil para el bloqueo de 15 mins durante el checkout
export const franjas = sqliteTable('franjas', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	date: text('date').notNull(),
	startTime: text('startTime').notNull(),
	endTime: text('endTime').notNull(),
	available: integer('available', { mode: 'boolean' }).notNull().default(true),

	// Timestamp en ms: Si es mayor a Date.now(), nadie más puede tomarla mientras se procesa el pago
	lockedUntil: integer('locked_until'),

	// Varias franjas pueden apuntar a la misma cita
	citaId: text('cita_id').references(() => citas.id, { onDelete: 'set null' })
});

// Tipos exportados para usar en tu frontend y actions
export type FranjaInsert = typeof franjas.$inferInsert;
export type TipoCitaSelect = typeof tiposCita.$inferSelect;
export type TipoCitaInsert = typeof tiposCita.$inferInsert;
export type CitaInsert = typeof citas.$inferInsert;
export type PagoSelect = typeof pagos.$inferSelect;