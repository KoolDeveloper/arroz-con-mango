import { drizzle } from 'drizzle-orm/d1';
import { eq, desc } from 'drizzle-orm';
import { pagos, citas } from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';

export const load = async ({ platform }) => {
	const d1 = platform?.env?.therapist_db;
	if (!d1) throw new Error('Base de datos no conectada');
	const db = drizzle(d1);

	const [listaPagos, listaCitas] = await Promise.all([
		db.select().from(pagos).orderBy(desc(pagos.creadoEn)),
		db.select().from(citas).orderBy(desc(citas.creadoEn))
	]);

	return {
		pagos: listaPagos,
		citas: listaCitas
	};
};

export const actions = {
	// 1. Crear o editar un pago
	guardarPago: async ({ request, platform }) => {
		const d1 = platform?.env?.therapist_db;
		if (!d1) return fail(500, { error: 'DB no conectada' });
		const db = drizzle(d1);

		const formData = await request.formData();
		const id = formData.get('id')?.toString() || crypto.randomUUID();
		const citaId = formData.get('citaId')?.toString();
		const mercadoPagoId =
			formData.get('mercadoPagoId')?.toString()?.trim() || `MANUAL-${Date.now()}`;
		const amount = Number(formData.get('amount'));
		const status = formData.get('status')?.toString() || 'aprobado';

		if (!citaId || isNaN(amount) || amount <= 0) {
			return fail(400, { error: 'Selecciona una cita válida e ingresa un monto mayor a 0.' });
		}

		try {
			await db
				.insert(pagos)
				.values({ id, citaId, mercadoPagoId, amount, status })
				.onConflictDoUpdate({
					target: pagos.id,
					set: { citaId, mercadoPagoId, amount, status }
				});
		} catch {
			return fail(400, { error: 'El ID de referencia de Mercado Pago ya existe en otro registro.' });
		}

		// Si el pago queda aprobado, confirmamos la cita automáticamente
		if (status === 'aprobado' || status === 'approved') {
			await db
				.update(citas)
				.set({ estadoPago: 'aprobado', estadoCita: 'confirmada' })
				.where(eq(citas.id, citaId));
		}

		return { success: true };
	},

	// 2. Eliminar un pago
	eliminarPago: async ({ request, platform }) => {
		const d1 = platform?.env?.therapist_db;
		if (!d1) return fail(500, { error: 'DB no conectada' });
		const db = drizzle(d1);

		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		if (!id) return fail(400, { error: 'ID de pago requerido' });

		await db.delete(pagos).where(eq(pagos.id, id));
		return { success: true };
	}
};