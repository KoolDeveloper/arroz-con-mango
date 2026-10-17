import { drizzle } from 'drizzle-orm/d1';
import { eq, desc } from 'drizzle-orm';
import { citas, franjas, pacientes, pagos } from '$lib/server/db/schema';

export const load = async ({ platform }) => {
	const d1 = platform?.env?.therapist_db;
	if (!d1) throw new Error('Base de datos no conectada');

	const db = drizzle(d1);

	const [todasLasCitas, franjasDisponibles, totalPacientes, pagosRecientes] = await Promise.all([
		db.select().from(citas).orderBy(desc(citas.creadoEn)).limit(5),
		db.select().from(franjas).where(eq(franjas.available, true)),
		db.select().from(pacientes),
		db.select().from(pagos).limit(10)
	]);

	const ingresosTotales = pagosRecientes
		.filter((p) => p.status === 'aprobado' || p.status === 'approved')
		.reduce((acumulado, pago) => acumulado + pago.amount, 0);

	return {
		metricas: {
			citasRecientes: todasLasCitas,
			totalFranjasLibres: franjasDisponibles.length,
			totalPacientes: totalPacientes.length,
			pagosRecientes,
			ingresosTotales
		}
	};
};