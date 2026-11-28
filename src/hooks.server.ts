import type { Handle } from '@sveltejs/kit';
import { validarSesion } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.usuario = null;

	const d1 = event.platform?.env?.therapist_db;
	// /dashboard se protege con Cloudflare Zero Trust, no con estas sesiones
	if (d1 && !event.url.pathname.startsWith('/dashboard')) {
		try {
			event.locals.usuario = await validarSesion(d1, event.cookies);
		} catch (err) {
			console.error('Error validando la sesión:', err);
		}
	}

	return resolve(event);
};
