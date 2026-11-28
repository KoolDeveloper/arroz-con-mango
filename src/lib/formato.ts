/** $50.000 (pesos colombianos, sin decimales) */
export const formatearPrecio = (cop: number) => `$${cop.toLocaleString('es-CO')}`;

/** Fecha y hora local legible, o "—" si no hay valor. */
export const formatearFechaHora = (d: Date | string | null | undefined) =>
	d ? new Date(d).toLocaleString('es-CO') : '—';
