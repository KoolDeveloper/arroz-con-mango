import type { franjas } from '$lib/server/db/schema';

export type FranjaDB = typeof franjas.$inferSelect;

export type EstadoCita = 'pendiente' | 'confirmada' | 'cancelada' | 'finalizada';
export type EstadoPago = 'pendiente' | 'aprobado' | 'cancelado' | 'reembolsado' | 'rechazado';
