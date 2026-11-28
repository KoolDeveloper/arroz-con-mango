import { drizzle } from 'drizzle-orm/d1';
import { and, desc, eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { talleres, usuariosTalleres } from '$lib/server/db/schema';

export const load = async ({ platform, locals }) => {
	const d1 = platform?.env?.therapist_db;
	if (!d1) error(500, 'Base de datos no conectada');
	const db = drizzle(d1);

	const [publicados, propios] = await Promise.all([
		db
			.select({
				id: talleres.id,
				nombre: talleres.nombre,
				precio: talleres.precio,
				descripcion: talleres.descripcion
			})
			.from(talleres)
			.where(eq(talleres.publicado, true))
			.orderBy(desc(talleres.creadoEn)),
		locals.usuario
			? db
					.select({ tallerId: usuariosTalleres.tallerId })
					.from(usuariosTalleres)
					.where(
						and(
							eq(usuariosTalleres.usuarioId, locals.usuario.id),
							eq(usuariosTalleres.estado, 'aprobado')
						)
					)
			: Promise.resolve([])
	]);

	const ownedTalleres = new Set(propios.map((p) => p.tallerId));

	return {
		usuario: locals.usuario,
		talleres: publicados.map((t) => ({ ...t, comprado: ownedTalleres.has(t.id) }))
	};
};
