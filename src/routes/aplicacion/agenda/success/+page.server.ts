import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

import { citas } from '$lib/server/db/schema';

export async function load({ url, platform }) {
	const citaId = url.searchParams.get('external_reference');

	if (!citaId) {
		throw error(404, 'No se encontró la referencia de la cita');
	}

	const d1 = platform?.env?.therapist_db;

	if (!d1) {
		throw error(500, 'Base de datos no disponible');
	}

	const db = drizzle(d1);

	const [cita] = await db
		.select()
		.from(citas)
		.where(eq(citas.id, citaId));

	return {
		cita,
		status: url.searchParams.get('status')
	};
}