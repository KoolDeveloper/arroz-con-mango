import { drizzle } from 'drizzle-orm/d1';
import { eq, asc } from 'drizzle-orm';
import { franjas } from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';

export const load = async ({ platform }) => {
	const d1 = platform?.env?.therapist_db;
	if (!d1) throw new Error('Base de datos no conectada');
	const db = drizzle(d1);

	const todasLasFranjas = await db
		.select()
		.from(franjas)
		.orderBy(asc(franjas.date), asc(franjas.startTime));

	return { franjas: todasLasFranjas };
};

export const actions = {
	// 1. Crear franjas dividiendo el rango en bloques de 1 hora
	abrirFranja: async ({ request, platform }) => {
		const d1 = platform?.env?.therapist_db;
		if (!d1) return fail(500, { error: 'DB no conectada' });
		const db = drizzle(d1);

		const formData = await request.formData();
		const date = formData.get('date')?.toString();
		const startTime = formData.get('startTime')?.toString();
		const endTime = formData.get('endTime')?.toString();

		if (!date || !startTime || !endTime) {
			return fail(400, { error: 'Faltan datos para crear la franja' });
		}

		const start = new Date(`2000-01-01T${startTime}:00`);
		const end = new Date(`2000-01-01T${endTime}:00`);
		const diferenciaMinutos = (end.getTime() - start.getTime()) / 60000;

		if (diferenciaMinutos < 60) {
			return fail(400, { error: 'El rango seleccionado debe ser de mínimo 1 hora.' });
		}

		const franjasAInsertar = [];
		const horaActual = new Date(start);

		while (horaActual < end) {
			const inicioBloque = horaActual.toTimeString().substring(0, 5);
			horaActual.setHours(horaActual.getHours() + 1);
			if (horaActual > end) break;
			const finBloque = horaActual.toTimeString().substring(0, 5);

			franjasAInsertar.push({
				date,
				startTime: inicioBloque,
				endTime: finBloque,
				available: true
			});
		}

		if (franjasAInsertar.length === 0) {
			return fail(400, { error: 'No se pudieron generar bloques válidos.' });
		}

		await db.insert(franjas).values(franjasAInsertar);
		return { success: true };
	},

	// 2. Editar fecha, hora o disponibilidad de una franja
	editarFranja: async ({ request, platform }) => {
		const d1 = platform?.env?.therapist_db;
		if (!d1) return fail(500, { error: 'DB no conectada' });
		const db = drizzle(d1);

		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const date = formData.get('date')?.toString();
		const startTime = formData.get('startTime')?.toString();
		const endTime = formData.get('endTime')?.toString();
		const available = formData.get('available') === 'true';

		if (!id || !date || !startTime || !endTime) {
			return fail(400, { error: 'Datos incompletos para actualizar la franja.' });
		}

		await db
			.update(franjas)
			.set({
				date,
				startTime,
				endTime,
				available,
				// Si se libera manualmente, limpiamos citaId
				citaId: available ? null : undefined
			})
			.where(eq(franjas.id, id));

		return { success: true };
	},

	// 3. Eliminar franja
	eliminarFranja: async ({ request, platform }) => {
		const d1 = platform?.env?.therapist_db;
		if (!d1) return fail(500, { error: 'DB no conectada' });
		const db = drizzle(d1);

		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		if (!id) return fail(400, { error: 'ID requerido' });

		await db.delete(franjas).where(eq(franjas.id, id));
		return { success: true };
	}
};