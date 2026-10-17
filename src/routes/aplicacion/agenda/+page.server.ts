/*import type { PageServerLoad } from './$types';
import type { Franja } from '$lib/types/agenda';


export const load: PageServerLoad = async () => {
	const franjas: Franja[] = [
		{ id: "1",date: '2026-10-02', startTime: '09:00', endTime: '10:00', available: true },
		{ id: "2", date: '2026-10-02', startTime: '10:00', endTime: '11:00', available: false },
		{ id: "3", date: '2026-10-02', startTime: '11:00', endTime: '12:00', available: true },
		{ id: "4", date: '2026-10-02', startTime: '12:00', endTime: '13:00', available: true },
		{ id: "5", date: '2026-10-02', startTime: '13:00', endTime: '14:00', available: false }
	];
	return { franjas };
};
*/

import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { franjas } from '$lib/server/db/schema';

export const load = async ({ platform }) => {
	const d1 = platform?.env?.therapist_db;
	if (!d1) throw new Error('Base de datos no conectada');

	const db = drizzle(d1);

	// El filtro ocurre 100% en el entorno seguro del Worker de Cloudflare
	const franjasDisponibles = await db.select().from(franjas).where(eq(franjas.available, true));

	return {
		// El frontend solo recibe este subset de datos ya sanitizado
		franjas: franjasDisponibles
	};
};
