import type { franjas, pacientes, citas, pagos } from '$lib/server/db/schema';

// 1. Tipos base de Drizzle
export type FranjaDB = typeof franjas.$inferSelect;
export type PacienteDB = typeof pacientes.$inferSelect;
export type PagoDB = typeof pagos.$inferSelect;
export type CitaDB = typeof citas.$inferSelect;

// 2. Enums y literales
export type EstadoCita = 'pendiente' | 'confirmada' | 'cancelada' | 'finalizada';
export type EstadoPago = 'pendiente' | 'aprobado' | 'cancelado' | 'reembolsado';

// 3. Tipos extendidos para el Frontend

export type CitaCompleta = CitaDB & {
	paciente: PacienteDB;
	franjas: FranjaDB[]; // Ahora es un array de franjas. Si dura 2 horas, habrá 2 o 4 franjas aquí.
	pago?: PagoDB;
	tipo: TipoCita;
};

// Si la tabla Franja en D1 no tiene la columna 'citaId' pero el frontend la espera, la extiendes:
export type Franja = FranjaDB & {
	citaId?: string;
};

// Tipos manuales que aún no están en DB o son puramente estructurales
export type TipoCita = {
	id: string;
	nombre: string;
	descripcion: string;
	precio: number;
	duracion: number;
	activo: boolean;
};