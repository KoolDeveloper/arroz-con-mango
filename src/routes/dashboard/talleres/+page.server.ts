import { drizzle } from 'drizzle-orm/d1';
import { desc, eq, sql } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { talleres, usuariosTalleres } from '$lib/server/db/schema';

export const load = async ({ platform }) => {
	const d1 = platform?.env?.therapist_db;
	if (!d1) throw new Error('Base de datos no conectada');
	const db = drizzle(d1);

	const lista = await db
		.select({
			id: talleres.id,
			nombre: talleres.nombre,
			precio: talleres.precio,
			publicado: talleres.publicado,
			actualizadoEn: talleres.actualizadoEn,
			compradores: sql<number>`count(case when ${usuariosTalleres.estado} = 'aprobado' then 1 end)`
		})
		.from(talleres)
		.leftJoin(usuariosTalleres, eq(usuariosTalleres.tallerId, talleres.id))
		.groupBy(talleres.id)
		.orderBy(desc(talleres.actualizadoEn));

	return { talleres: lista };
};

export const actions = {
	alternarPublicado: async ({ request, platform }) => {
		const d1 = platform?.env?.therapist_db;
		if (!d1) return fail(500, { error: 'DB no conectada' });
		const form = await request.formData();
		const id = form.get('id')?.toString();
		if (!id) return fail(400, { error: 'ID requerido' });
		await drizzle(d1)
			.update(talleres)
			.set({ publicado: form.get('publicado') === 'true' })
			.where(eq(talleres.id, id));
		return { success: true };
	},

	eliminar: async ({ request, platform }) => {
		const d1 = platform?.env?.therapist_db;
		if (!d1) return fail(500, { error: 'DB no conectada' });
		const id = (await request.formData()).get('id')?.toString();
		if (!id) return fail(400, { error: 'ID requerido' });
		// Los accesos se borran en cascada; los pagos quedan registrados (compra_taller_id = null)
		await drizzle(d1).delete(talleres).where(eq(talleres.id, id));
		return { success: true };
	}
};
