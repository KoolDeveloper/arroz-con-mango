import { sqliteTable, text, integer, uniqueIndex, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import type { EstadoCita, EstadoPago } from '$lib/types/agenda';
import type { EstadoCompraTaller } from '$lib/types/talleres';

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

// 2. USUARIOS (antes "pacientes"): email único para hacer upsert si vuelven a agendar.
// Una fila puede venir de una cita, de un login con código por correo o de Google.
export const usuarios = sqliteTable('usuarios', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	nombre: text('nombre').notNull(),
	email: text('email').notNull().unique(),
	telefono: text('telefono'),
	googleId: text('google_id').unique(),
	creadoEn: integer('creado_en', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`)
});

// 3. CITAS: Conectada con usuarios y tiposCita + timestamp automático
export const citas = sqliteTable('citas', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	usuarioId: text('usuario_id')
		.notNull()
		.references(() => usuarios.id),
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

// 4. TALLERES: contenido en Markdown (un enlace de YouTube en su propia línea se vuelve iframe)
export const talleres = sqliteTable('talleres', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	nombre: text('nombre').notNull(),
	precio: integer('precio').notNull(), // COP
	descripcion: text('descripcion').notNull().default(''),
	contenido: text('contenido').notNull().default(''),
	publicado: integer('publicado', { mode: 'boolean' }).notNull().default(false),
	creadoEn: integer('creado_en', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
	actualizadoEn: integer('actualizado_en', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});

// 5. USUARIOS_TALLERES ("ownedTalleres"): una fila por usuario + taller.
// estado 'aprobado' = el usuario tiene acceso. Su id viaja como referencia externa del pago.
export const usuariosTalleres = sqliteTable(
	'usuarios_talleres',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		usuarioId: text('usuario_id')
			.notNull()
			.references(() => usuarios.id, { onDelete: 'cascade' }),
		tallerId: text('taller_id')
			.notNull()
			.references(() => talleres.id, { onDelete: 'cascade' }),
		estado: text('estado').$type<EstadoCompraTaller>().notNull().default('pendiente'),
		creadoEn: integer('creado_en', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date()),
		aprobadoEn: integer('aprobado_en', { mode: 'timestamp' })
	},
	(t) => [uniqueIndex('usuarios_talleres_usuario_taller_unique').on(t.usuarioId, t.tallerId)]
);

// 6. PAGOS: apunta a una cita O a una compra de taller (permite varios intentos si uno falla)
export const pagos = sqliteTable('pagos', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	citaId: text('cita_id').references(() => citas.id),
	compraTallerId: text('compra_taller_id').references(() => usuariosTalleres.id, {
		onDelete: 'set null'
	}),
	mercadoPagoId: text('mercado_pago_id').notNull().unique(), // ID de transacción de MP / PayPal
	amount: integer('amount').notNull(),
	status: text('status').notNull(),
	creadoEn: integer('creado_en', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});

// 7. FRANJAS: Incluye lockedUntil para el bloqueo de 15 mins durante el checkout
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

// 8. SESIONES: el id es el SHA-256 del token de la cookie (el token en claro nunca se guarda)
export const sesiones = sqliteTable(
	'sesiones',
	{
		id: text('id').primaryKey(),
		usuarioId: text('usuario_id')
			.notNull()
			.references(() => usuarios.id, { onDelete: 'cascade' }),
		expiraEn: integer('expira_en', { mode: 'timestamp' }).notNull()
	},
	(t) => [index('sesiones_usuario_idx').on(t.usuarioId)]
);

// 9. CÓDIGOS DE ACCESO: login sin contraseña. Un código vigente por email (se reemplaza al pedir otro).
// Guardamos el SHA-256 del código, nunca el código.
export const codigosAcceso = sqliteTable('codigos_acceso', {
	email: text('email').primaryKey(),
	codigoHash: text('codigo_hash').notNull(),
	intentos: integer('intentos').notNull().default(0),
	creadoEn: integer('creado_en', { mode: 'timestamp' }).notNull(),
	expiraEn: integer('expira_en', { mode: 'timestamp' }).notNull()
});

// Tipos exportados para usar en tu frontend y actions
export type TipoCitaSelect = typeof tiposCita.$inferSelect;
export type PagoSelect = typeof pagos.$inferSelect;
