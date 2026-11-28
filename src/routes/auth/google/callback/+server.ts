import { redirect } from '@sveltejs/kit';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { usuarios } from '$lib/server/db/schema';
import { crearSesion, destinoSeguro, normalizarEmail } from '$lib/server/auth';
import { obtenerPerfilGoogle } from '$lib/server/google';
import { getBaseUrl } from '$lib/server/payments';

export async function GET({ url, platform, cookies }) {
	const d1 = platform?.env?.therapist_db;
	const state = url.searchParams.get('state');
	const code = url.searchParams.get('code');
	const stateGuardado = cookies.get('google_state');
	const verifier = cookies.get('google_verifier');
	const destino = destinoSeguro(cookies.get('google_redirect'));

	for (const nombre of ['google_state', 'google_verifier', 'google_redirect']) {
		cookies.delete(nombre, { path: '/auth/google' });
	}

	const fallo = `/auth/login?error=google&redirectTo=${encodeURIComponent(destino)}`;
	if (!d1 || !code || !state || !verifier || state !== stateGuardado) redirect(303, fallo);

	let perfil;
	try {
		const redirectUri = `${getBaseUrl(url.origin, platform?.env)}/auth/google/callback`;
		perfil = await obtenerPerfilGoogle(code, verifier, redirectUri, platform?.env);
	} catch (err) {
		console.error(err);
		redirect(303, fallo);
	}

	const email = normalizarEmail(perfil.email);
	if (!perfil.sub || !email || !perfil.email_verified) redirect(303, fallo);

	const db = drizzle(d1);
	let [usuario] = await db.select().from(usuarios).where(eq(usuarios.googleId, perfil.sub));

	if (!usuario) {
		const [porEmail] = await db.select().from(usuarios).where(eq(usuarios.email, email));
		if (porEmail) {
			// Google ya verificó el email: vinculamos la cuenta existente (p.ej. de una cita)
			[usuario] = await db
				.update(usuarios)
				.set({ googleId: perfil.sub })
				.where(eq(usuarios.id, porEmail.id))
				.returning();
		} else {
			[usuario] = await db
				.insert(usuarios)
				.values({
					nombre: perfil.name?.trim() || email.split('@')[0],
					email,
					googleId: perfil.sub
				})
				.returning();
		}
	}

	await crearSesion(d1, cookies, usuario.id);
	redirect(303, destino);
}
