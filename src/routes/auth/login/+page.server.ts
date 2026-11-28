import { fail, redirect } from '@sveltejs/kit';
import { drizzle } from 'drizzle-orm/d1';
import { usuarios } from '$lib/server/db/schema';
import {
	crearCodigo,
	crearSesion,
	destinoSeguro,
	emailValido,
	normalizarEmail,
	verificarCodigo
} from '$lib/server/auth';
import { correoCodigo, enviarCorreo } from '$lib/server/email';
import { googleDisponible } from '$lib/server/google';

export const load = async ({ locals, url, platform }) => {
	const redirectTo = destinoSeguro(url.searchParams.get('redirectTo'));
	if (locals.usuario) redirect(303, redirectTo);
	return {
		redirectTo,
		google: googleDisponible(platform?.env),
		errorGoogle: url.searchParams.get('error') === 'google'
	};
};

type Paso = { paso: 'email' | 'codigo'; email: string; error?: string; aviso?: string };

export const actions = {
	/** Paso 1: enviar un código de 6 dígitos al correo. */
	enviar: async ({ request, platform }) => {
		const d1 = platform?.env?.therapist_db;
		const email = normalizarEmail((await request.formData()).get('email')?.toString());
		if (!d1)
			return fail(500, {
				paso: 'email',
				email,
				error: 'Base de datos no conectada.'
			} satisfies Paso);
		if (!emailValido(email)) {
			return fail(400, { paso: 'email', email, error: 'Ingresa un correo válido.' } satisfies Paso);
		}

		const codigo = await crearCodigo(d1, email);
		if (codigo) {
			await enviarCorreo({ para: email, ...correoCodigo(codigo) }, platform?.env);
			return { paso: 'codigo', email, aviso: `Te enviamos un código a ${email}.` } satisfies Paso;
		}
		return {
			paso: 'codigo',
			email,
			aviso:
				'Ya te enviamos un código hace menos de un minuto. Revisa tu correo (y la carpeta de spam).'
		} satisfies Paso;
	},

	/** Paso 2: validar el código y abrir sesión (crea la cuenta si es la primera vez). */
	verificar: async ({ request, platform, cookies }) => {
		const d1 = platform?.env?.therapist_db;
		const form = await request.formData();
		const email = normalizarEmail(form.get('email')?.toString());
		const codigo = (form.get('codigo')?.toString() ?? '').replace(/\D/g, '');
		const redirectTo = destinoSeguro(form.get('redirectTo')?.toString());

		if (!d1)
			return fail(500, {
				paso: 'codigo',
				email,
				error: 'Base de datos no conectada.'
			} satisfies Paso);
		if (!emailValido(email)) return fail(400, { paso: 'email', email } satisfies Paso);
		if (codigo.length !== 6) {
			return fail(400, {
				paso: 'codigo',
				email,
				error: 'El código tiene 6 dígitos.'
			} satisfies Paso);
		}

		const resultado = await verificarCodigo(d1, email, codigo);
		if (resultado === 'invalido') {
			return fail(400, {
				paso: 'codigo',
				email,
				error: 'Código incorrecto. Inténtalo de nuevo.'
			} satisfies Paso);
		}
		if (resultado === 'expirado') {
			return fail(400, {
				paso: 'email',
				email,
				error: 'El código venció o tuvo demasiados intentos. Pide uno nuevo.'
			} satisfies Paso);
		}

		// Si ya existía (p.ej. agendó una cita) se reutiliza; si no, se crea la cuenta
		const [usuario] = await drizzle(d1)
			.insert(usuarios)
			.values({ nombre: email.split('@')[0], email })
			.onConflictDoUpdate({ target: usuarios.email, set: { email } })
			.returning({ id: usuarios.id });

		await crearSesion(d1, cookies, usuario.id);
		redirect(303, redirectTo);
	}
};
