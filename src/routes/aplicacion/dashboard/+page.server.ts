import { drizzle } from 'drizzle-orm/d1';
import { eq, desc } from 'drizzle-orm';
import { citas, franjas, pacientes, pagos } from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';

export const load = async ({ platform }) => {
	const d1 = platform?.env?.therapist_db;
	if (!d1) throw new Error('Base de datos no conectada');

	const db = drizzle(d1);

	const [todasLasCitas, franjasDisponibles, totalPacientes, pagosRecientes] = await Promise.all([
		db.select().from(citas).orderBy(desc(citas.creadoEn)).limit(10),
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

export const actions = {
	// Acción rápida para abrir una nueva franja desde el dashboard
	abrirFranja: async ({ request, platform }) => {
		const d1 = platform?.env?.therapist_db;
		const db = drizzle(d1!);

		const formData = await request.formData();
		const date = formData.get('date')?.toString();
		const startTime = formData.get('startTime')?.toString();
		const endTime = formData.get('endTime')?.toString();

		if (!date || !startTime || !endTime) {
			return fail(400, { error: 'Faltan datos para crear la franja' });
		}

		// Usamos una fecha arbitraria solo para poder calcular la diferencia de horas de forma segura
		const start = new Date(`2000-01-01T${startTime}:00`);
		const end = new Date(`2000-01-01T${endTime}:00`);

		const diferenciaMinutos = (end.getTime() - start.getTime()) / 60000;

		if (diferenciaMinutos < 60) {
			return fail(400, { error: 'El rango seleccionado debe ser de mínimo 1 hora.' });
		}

		// Array para guardar todas las franjas de 1 hora que se generen
		const franjasAInsertar = [];
		const horaActual = new Date(start);

		// Bucle para dividir el rango largo en fragmentos exactos de 60 minutos
		while (horaActual < end) {
			const inicioBloque = horaActual.toTimeString().substring(0, 5); // Ej: "08:00"

			horaActual.setHours(horaActual.getHours() + 1); // Sumamos 1 hora exacta

			// Si al sumar la hora nos pasamos del límite final, detenemos el bucle
			if (horaActual > end) break;

			const finBloque = horaActual.toTimeString().substring(0, 5); // Ej: "09:00"

			franjasAInsertar.push({
				date,
				startTime: inicioBloque,
				endTime: finBloque,
				available: true
				// No necesitamos enviar el 'id' porque Drizzle lo genera con crypto.randomUUID()
			});
		}

		if (franjasAInsertar.length === 0) {
			return fail(400, { error: 'No se pudieron generar bloques válidos de 1 hora.' });
		}

		// Insertamos todos los bloques en masa (Bulk Insert)
		await db.insert(franjas).values(franjasAInsertar);

		return { success: true };
	},

	// Acción para forzar la cancelación de una cita
	cancelarCita: async ({ request, platform }) => {
		const d1 = platform?.env?.therapist_db;
		const db = drizzle(d1!);

		const formData = await request.formData();
		const citaId = formData.get('citaId')?.toString();

		if (!citaId) return fail(400, { error: 'ID de cita requerido' });

		// 1. Marcar la cita como cancelada
		await db.update(citas).set({ estadoCita: 'cancelada' }).where(eq(citas.id, citaId));

		// 2. Liberar las franjas asociadas a esa cita
		await db
			.update(franjas)
			.set({ available: true, citaId: null })
			.where(eq(franjas.citaId, citaId));

		return { success: true };
	}
};
