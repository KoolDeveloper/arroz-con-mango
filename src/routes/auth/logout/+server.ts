import { redirect } from '@sveltejs/kit';
import { cerrarSesion } from '$lib/server/auth';

// Solo POST: un GET podría dispararse desde un <img> en otro sitio (SvelteKit valida el origen del POST)
export async function POST({ platform, cookies }) {
	const d1 = platform?.env?.therapist_db;
	if (d1) await cerrarSesion(d1, cookies);
	redirect(303, '/aplicacion/talleres');
}
