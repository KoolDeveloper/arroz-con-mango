import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import type { EstadoCita, EstadoPago } from '$lib/types/agenda';

export const pacientes = sqliteTable('pacientes', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	nombre: text('nombre').notNull(),
	email: text('email').notNull(),
	telefono: text('telefono').notNull()
});

export const pagos = sqliteTable('pagos', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	cita_id: text('cita_id').notNull(),
	mercado_pago_id: text('mercado_pago_id').notNull(),
	amount: integer('amount').notNull(),
	status: text('status').notNull()
});

export const citas = sqliteTable('citas', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	pacienteId: text('paciente_id').notNull(),
	pagoId: text('pago_id'),

	estadoCita: text('estado_cita').$type<EstadoCita>().notNull().default('pendiente'),
	estadoPago: text('estado_pago').$type<EstadoPago>().notNull().default('pendiente'),

	tipoCitaId: text('tipo_cita_id').notNull(),
	notasCliente: text('notas_cliente'),
	creadoEn: integer('creado_en', { mode: 'timestamp' }).notNull()
});

export const franjas = sqliteTable('franjas', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	date: text('date').notNull(),
	startTime: text('startTime').notNull(),
	endTime: text('endTime').notNull(),
	available: integer('available', { mode: 'boolean' }).notNull().default(true),

	// Aquí está la clave: Varias franjas pueden apuntar a la misma cita
	citaId: text('cita_id') // Es null si la franja está disponible
});

export type FranjaInsert = typeof franjas.$inferInsert;
