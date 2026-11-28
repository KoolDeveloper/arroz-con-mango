import { error, redirect } from '@sveltejs/kit';
import { destinoSeguro } from '$lib/server/auth';
import { crearUrlAutorizacion, googleDisponible } from '$lib/server/google';
import { getBaseUrl } from '$lib/server/payments';

const COOKIE_OPTS = { path: '/auth/google', httpOnly: true, sameSite: 'lax', maxAge: 600 } as const;

export async function GET({ url, platform, cookies }) {
	if (!googleDisponible(platform?.env))
		error(404, 'El inicio de sesión con Google no está habilitado');

	const redirectUri = `${getBaseUrl(url.origin, platform?.env)}/auth/google/callback`;
	const {
		url: authUrl,
		state,
		codeVerifier
	} = await crearUrlAutorizacion(redirectUri, platform?.env);

	cookies.set('google_state', state, COOKIE_OPTS);
	cookies.set('google_verifier', codeVerifier, COOKIE_OPTS);
	cookies.set('google_redirect', destinoSeguro(url.searchParams.get('redirectTo')), COOKIE_OPTS);

	redirect(302, authUrl);
}
