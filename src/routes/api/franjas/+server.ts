import { json } from '@sveltejs/kit';
import { franjasDB } from '$lib/server/db/franjas';

export async function GET({ request, platform }) {
	const db = platform?.env?.therapist_db;
	if (!db) return json({ error: 'Base de datos no conectada' }, { status: 500 });

	// Permite filtrar desde el dashboard usando ?date=2026-03-15
	const url = new URL(request.url);
	const date = url.searchParams.get('date');

	try {
		const franjas = await franjasDB.getAll(db, date);
		return json(franjas);
	} catch (error: unknown) {
		return json(
			{ error: 'Error al leer franjas' },
			{ status: (error as { status: number }).status || 500 }
		);
	}
}

export async function POST({ request, platform }) {
	const db = platform?.env?.therapist_db;
	if (!db) return json({ error: 'Base de datos no conectada' }, { status: 500 });

	try {
		const body = await request.json();
		const id = await franjasDB.create(db, body);

		if (!id) return json({ error: 'Fallo al insertar en DB' }, { status: 400 });

		return json({ id, message: 'Franja creada con éxito' }, { status: 201 });
	} catch (error: unknown) {
		return json(
			{ error: 'Error procesando la solicitud' },
			{ status: (error as { status: number }).status || 500 }
		);
	}
}
