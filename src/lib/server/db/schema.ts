import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const citas = sqliteTable('citas', {
	id: integer('id').primaryKey(),
	nombre: text('nombre').notNull(),
	email: text('email').notNull(),
	fecha: text('fecha').notNull(),
	hora: text('hora').notNull(),
	estado: text('estado').notNull()
});
