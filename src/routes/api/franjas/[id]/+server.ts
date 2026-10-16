import { json } from '@sveltejs/kit';
import { franjasDB } from '$lib/server/db/franjas';

export async function DELETE({ params, platform }) {
	const db = platform?.env?.therapist_db;
	if (!db) return json({ error: 'Base de datos no conectada' }, { status: 500 });

	const { id } = params; // Captura el [id] de la URL (ej: /api/franjas/123-abc)

	try {
		const exito = await franjasDB.delete(db, id);

		if (!exito)
			return json({ error: 'Franja no encontrada o no se pudo eliminar' }, { status: 404 });

		return json({ message: 'Franja eliminada correctamente' });
	} catch (error: unknown) {
		return json(
			{ error: 'Error procesando la eliminación' },
			{ status: (error as { status: number }).status || 500 }
		);
	}
}
