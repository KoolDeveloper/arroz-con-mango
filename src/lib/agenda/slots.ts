import type { FranjaDB } from '$lib/types/agenda';

/** Un bloque reservable: una o varias franjas consecutivas. */
export type Bloque = {
	ids: string[];
	startTime: string;
	endTime: string;
};

/** Días (YYYY-MM-DD) que tienen al menos una franja disponible, ordenados. */
export function fechasConDisponibilidad(franjas: FranjaDB[]): string[] {
	const fechas = franjas.filter((f) => f.available).map((f) => f.date);
	return [...new Set(fechas)].sort();
}

/** Bloques de `duracion` franjas consecutivas y disponibles para una fecha. */
export function bloquesDisponibles(franjas: FranjaDB[], fecha: string, duracion: number): Bloque[] {
	if (!fecha) return [];
	const delDia = franjas.filter((f) => f.date === fecha);
	const resultado: Bloque[] = [];

	for (let i = 0; i <= delDia.length - duracion; i++) {
		const grupo = delDia.slice(i, i + duracion);
		const consecutivas = grupo.every(
			(actual, idx) =>
				actual.available &&
				(idx === grupo.length - 1 || actual.endTime === grupo[idx + 1].startTime)
		);
		if (consecutivas) {
			resultado.push({
				ids: grupo.map((g) => g.id),
				startTime: grupo[0].startTime,
				endTime: grupo.at(-1)!.endTime
			});
		}
	}
	return resultado;
}

/** Partes de una fecha ISO formateadas en español. */
export function formatearFecha(iso: string) {
	// Mediodía para evitar saltos de día por zona horaria
	const d = new Date(`${iso}T12:00:00`);
	const fmt = (o: Intl.DateTimeFormatOptions) => d.toLocaleDateString('es-CO', o);
	return {
		dia: fmt({ weekday: 'short' }).replace('.', ''),
		num: d.getDate(),
		mes: fmt({ month: 'short' }).replace('.', ''),
		largo: fmt({ weekday: 'long', day: 'numeric', month: 'long' })
	};
}

export const formatearPrecio = (cop: number) => `$${cop.toLocaleString('es-CO')}`;
