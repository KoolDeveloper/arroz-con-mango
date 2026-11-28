import { readEnv } from '$lib/server/payments';
import { generarToken, sha256 } from '$lib/server/auth';

type PlatformEnv = Record<string, unknown> | undefined;

export function googleDisponible(platformEnv?: PlatformEnv): boolean {
	return Boolean(
		readEnv('GOOGLE_CLIENT_ID', platformEnv) && readEnv('GOOGLE_CLIENT_SECRET', platformEnv)
	);
}

function base64UrlDeHex(hex: string): string {
	const bytes = Uint8Array.from(hex.match(/../g)!.map((h) => parseInt(h, 16)));
	let bin = '';
	for (const b of bytes) bin += String.fromCharCode(b);
	return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** URL de autorización de Google con state + PKCE (S256). */
export async function crearUrlAutorizacion(redirectUri: string, platformEnv?: PlatformEnv) {
	const state = generarToken();
	const codeVerifier = generarToken();
	const codeChallenge = base64UrlDeHex(await sha256(codeVerifier));

	const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
	url.searchParams.set('client_id', readEnv('GOOGLE_CLIENT_ID', platformEnv)!);
	url.searchParams.set('redirect_uri', redirectUri);
	url.searchParams.set('response_type', 'code');
	url.searchParams.set('scope', 'openid email profile');
	url.searchParams.set('state', state);
	url.searchParams.set('code_challenge', codeChallenge);
	url.searchParams.set('code_challenge_method', 'S256');
	url.searchParams.set('prompt', 'select_account');

	return { url: url.toString(), state, codeVerifier };
}

export type PerfilGoogle = {
	sub: string;
	email: string;
	email_verified: boolean;
	name?: string;
};

/** Intercambia el code por tokens y lee el perfil del usuario. */
export async function obtenerPerfilGoogle(
	code: string,
	codeVerifier: string,
	redirectUri: string,
	platformEnv?: PlatformEnv
): Promise<PerfilGoogle> {
	const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			code,
			code_verifier: codeVerifier,
			client_id: readEnv('GOOGLE_CLIENT_ID', platformEnv)!,
			client_secret: readEnv('GOOGLE_CLIENT_SECRET', platformEnv)!,
			redirect_uri: redirectUri,
			grant_type: 'authorization_code'
		})
	});
	if (!tokenRes.ok) {
		console.error('Error Google token:', await tokenRes.text());
		throw new Error('No se pudo validar el inicio de sesión con Google.');
	}
	const { access_token } = (await tokenRes.json()) as { access_token: string };

	const perfilRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
		headers: { Authorization: `Bearer ${access_token}` }
	});
	if (!perfilRes.ok) throw new Error('No se pudo leer el perfil de Google.');
	return (await perfilRes.json()) as PerfilGoogle;
}
