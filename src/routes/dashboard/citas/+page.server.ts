import { drizzle } from 'drizzle-orm/d1';
import { eq, desc } from 'drizzle-orm';
import { citas, tiposCita, pacientes, franjas } from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';
import type { EstadoCita, EstadoPago } from '$lib/types/agenda';

export const load = async ({ platform }) => {
	const d1 = platform?.env?.therapist_db;
	if (!d1) throw new Error('Base de datos no conectada');
	const db = drizzle(d1);

	const [listaCitas, catalogo, listaPacientes] = await Promise.all([
		db
			.select({
				id: citas.id,
				pacienteId: citas.pacienteId,
				tipoCitaId: citas.tipoCitaId,
				estadoCita: citas.estadoCita,
				estadoPago: citas.estadoPago,
				notasCliente: citas.notasCliente,
				creadoEn: citas.creadoEn,
				pacienteNombre: pacientes.nombre,
				pacienteEmail: pacientes.email,
				tipoNombre: tiposCita.nombre
			})
			.from(citas)
			.leftJoin(pacientes, eq(citas.pacienteId, pacientes.id))
			.leftJoin(tiposCita, eq(citas.tipoCitaId, tiposCita.id))
			.orderBy(desc(citas.creadoEn)),
		db.select().from(tiposCita),
		db.select().from(pacientes)
	]);

	return {
		citas: listaCitas,
		servicios: catalogo,
		pacientes: listaPacientes
	};
};

export const actions = {
	// 1. Crear o Actualizar Tipo de Cita
	guardarServicio: async ({ request, platform }) => {
		const d1 = platform?.env?.therapist_db;
		if (!d1) return fail(500, { error: 'DB no conectada' });
		const db = drizzle(d1);

		const formData = await request.formData();
		const id = formData.get('id')?.toString() || crypto.randomUUID();
		const nombre = formData.get('nombre')?.toString()?.trim();
		const descripcion = formData.get('descripcion')?.toString()?.trim() || null;
		const duracionFranjas = Number(formData.get('duracionFranjas'));
		const precio = Number(formData.get('precio'));

		if (!nombre || isNaN(duracionFranjas) || duracionFranjas < 1 || isNaN(precio) || precio < 0) {
			return fail(400, { error: 'Datos de servicio inválidos.' });
		}

		await db
			.insert(tiposCita)
			.values({ id, nombre, descripcion, duracionFranjas, precio, activo: true })
			.onConflictDoUpdate({
				target: tiposCita.id,
				set: { nombre, descripcion, duracionFranjas, precio }
			});

		return { success: true };
	},

	// 2. Activar / Ocultar Tipo de Cita
	toggleServicio: async ({ request, platform }) => {
		const d1 = platform?.env?.therapist_db;
		if (!d1) return fail(500, { error: 'DB no conectada' });
		const db = drizzle(d1);

		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const activo = formData.get('activo') === 'true';

		if (!id) return fail(400, { error: 'ID requerido' });

		await db.update(tiposCita).set({ activo: !activo }).where(eq(tiposCita.id, id));
		return { success: true };
	},

	// 3. Eliminar Tipo de Cita
	eliminarServicio: async ({ request, platform }) => {
		const d1 = platform?.env?.therapist_db;
		if (!d1) return fail(500, { error: 'DB no conectada' });
		const db = drizzle(d1);

		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		if (!id) return fail(400, { error: 'ID requerido' });

		try {
			await db.delete(tiposCita).where(eq(tiposCita.id, id));
			return { success: true };
		} catch {
			return fail(400, {
				error: 'No se puede eliminar porque hay citas asociadas. Usa "Ocultar".'
			});
		}
	},

	// 4. Actualizar Estado y Notas de una Cita (Tupla directa en db.batch para evitar error de TS)
	actualizarCita: async ({ request, platform }) => {
		const d1 = platform?.env?.therapist_db;
		if (!d1) return fail(500, { error: 'DB no conectada' });
		const db = drizzle(d1);

		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const estadoCita = formData.get('estadoCita') as EstadoCita;
		const estadoPago = formData.get('estadoPago') as EstadoPago;
		const notasCliente = formData.get('notasCliente')?.toString() ?? null;

		if (!id) return fail(400, { error: 'ID de cita requerido' });

		const updateCitaQuery = db
			.update(citas)
			.set({ estadoCita, estadoPago, notasCliente })
			.where(eq(citas.id, id));

		if (estadoCita === 'cancelada') {
			await db.batch([
				updateCitaQuery,
				db
					.update(franjas)
					.set({ available: true, citaId: null })
					.where(eq(franjas.citaId, id))
			]);
		} else {
			await updateCitaQuery;
		}

		return { success: true };
	},

	// 5. Eliminar Cita y liberar sus franjas
	eliminarCita: async ({ request, platform }) => {
		const d1 = platform?.env?.therapist_db;
		if (!d1) return fail(500, { error: 'DB no conectada' });
		const db = drizzle(d1);

		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		if (!id) return fail(400, { error: 'ID de cita requerido' });

		await db.batch([
			db
				.update(franjas)
				.set({ available: true, citaId: null })
				.where(eq(franjas.citaId, id)),
			db.delete(citas).where(eq(citas.id, id))
		]);

		return { success: true };
	}
};