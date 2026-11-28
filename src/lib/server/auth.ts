import type { Cookies } from '@sveltejs/kit';
import type { D1Database } from '@cloudflare/workers-types';
import { drizzle } from 'drizzle-orm/d1';
import { and, eq, gt, lt, sql } from 'drizzle-orm';
import { codigosAcceso, sesiones, usuarios } from '$lib/server/db/schema';

// Login sin contraseñas (código por correo o Google): no hay hashing lento, así que cada
// petición cabe holgada en los 10 ms de CPU del plan gratuito de Workers.

const COOKIE_SESION = 'sesion';
const DURACION_SESION_MS = 30 * 24 * 60 * 60 * 1000; // 30 días
const RENOVAR_SI_QUEDAN_MS = 15 * 24 * 60 * 60 * 1000; // renovación deslizante

const VIGENCIA_CODIGO_MS = 10 * 60 * 1000; // 10 minutos
const ESPERA_REENVIO_MS = 60 * 1000; // no reenviar más de un código por minuto
const MAX_INTENTOS = 5;

export type UsuarioSesion = { id: string; nombre: string; email: string };

// ───────────────────────── Utilidades ─────────────────────────

/** Token aleatorio de 256 bits, apto para URLs y cookies. */
export function generarToken(): string {
	let bin = '';
	for (const b of crypto.getRandomValues(new Uint8Array(32))) bin += String.fromCharCode(b);
	return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** SHA-256 en hex: en la DB guardamos hashes de tokens y códigos, nunca los valores. */
export async function sha256(texto: string): Promise<string> {
	const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto));
	return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function igualesTiempoConstante(a: string, b: string): boolean {
	if (a.length !== b.length) return false;
	let diff = 0;
	for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
	return diff === 0;
}

export function normalizarEmail(email: string | null | undefined): string {
	return (email ?? '').toString().trim().toLowerCase();
}

export function emailValido(email: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

/** Solo permite rutas internas para evitar open redirects (//evil.com, https://...). */
export function destinoSeguro(
	valor: string | null | undefined,
	porDefecto = '/aplicacion/talleres'
) {
	if (!valor || !valor.startsWith('/') || valor.startsWith('//') || valor.includes('\\')) {
		return porDefecto;
	}
	return valor;
}

// ───────────────────────── Códigos de acceso por correo ─────────────────────────

const hashCodigo = (email: string, codigo: string) => sha256(`${email}:${codigo}`);

/**
 * Genera un código de 6 dígitos para el email (reemplaza el anterior).
 * Devuelve null si se pidió otro hace menos de un minuto (evita gastar la cuota de correos).
 */
export async function crearCodigo(d1: D1Database, email: string): Promise<string | null> {
	const db = drizzle(d1);
	const ahora = Date.now();

	const [previo] = await db.select().from(codigosAcceso).where(eq(codigosAcceso.email, email));
	if (previo && ahora - previo.creadoEn.getTime() < ESPERA_REENVIO_MS) return null;

	const codigo = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000).padStart(6, '0');
	const fila = {
		codigoHash: await hashCodigo(email, codigo),
		intentos: 0,
		creadoEn: new Date(ahora),
		expiraEn: new Date(ahora + VIGENCIA_CODIGO_MS)
	};
	await db
		.insert(codigosAcceso)
		.values({ email, ...fila })
		.onConflictDoUpdate({ target: codigosAcceso.email, set: fila });

	return codigo;
}

export type ResultadoCodigo = 'ok' | 'invalido' | 'expirado';

/** Valida el código (máx. 5 intentos). Si es correcto lo consume. */
export async function verificarCodigo(
	d1: D1Database,
	email: string,
	codigo: string
): Promise<ResultadoCodigo> {
	const db = drizzle(d1);
	const [fila] = await db.select().from(codigosAcceso).where(eq(codigosAcceso.email, email));

	if (!fila || fila.expiraEn.getTime() < Date.now() || fila.intentos >= MAX_INTENTOS) {
		return 'expirado';
	}

	if (!igualesTiempoConstante(await hashCodigo(email, codigo), fila.codigoHash)) {
		await db
			.update(codigosAcceso)
			.set({ intentos: sql`${codigosAcceso.intentos} + 1` })
			.where(eq(codigosAcceso.email, email));
		return fila.intentos + 1 >= MAX_INTENTOS ? 'expirado' : 'invalido';
	}

	await db.delete(codigosAcceso).where(eq(codigosAcceso.email, email));
	return 'ok';
}

// ───────────────────────── Sesiones ─────────────────────────

export async function crearSesion(d1: D1Database, cookies: Cookies, usuarioId: string) {
	const db = drizzle(d1);
	const token = generarToken();
	const expiraEn = new Date(Date.now() + DURACION_SESION_MS);

	await db.batch([
		// Limpieza barata: borra las sesiones vencidas de este usuario
		db
			.delete(sesiones)
			.where(and(eq(sesiones.usuarioId, usuarioId), lt(sesiones.expiraEn, new Date()))),
		db.insert(sesiones).values({ id: await sha256(token), usuarioId, expiraEn })
	]);
	ponerCookieSesion(cookies, token, expiraEn);
}

function ponerCookieSesion(cookies: Cookies, token: string, expiraEn: Date) {
	cookies.set(COOKIE_SESION, token, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		expires: expiraEn
	});
}

/** Devuelve el usuario de la sesión (o null) y renueva la sesión si está por vencer. */
export async function validarSesion(
	d1: D1Database,
	cookies: Cookies
): Promise<UsuarioSesion | null> {
	const token = cookies.get(COOKIE_SESION);
	if (!token) return null;

	const db = drizzle(d1);
	const id = await sha256(token);
	const [fila] = await db
		.select({
			expiraEn: sesiones.expiraEn,
			id: usuarios.id,
			nombre: usuarios.nombre,
			email: usuarios.email
		})
		.from(sesiones)
		.innerJoin(usuarios, eq(sesiones.usuarioId, usuarios.id))
		.where(and(eq(sesiones.id, id), gt(sesiones.expiraEn, new Date())));

	if (!fila) {
		cookies.delete(COOKIE_SESION, { path: '/' });
		return null;
	}

	if (fila.expiraEn.getTime() - Date.now() < RENOVAR_SI_QUEDAN_MS) {
		const expiraEn = new Date(Date.now() + DURACION_SESION_MS);
		await db.update(sesiones).set({ expiraEn }).where(eq(sesiones.id, id));
		ponerCookieSesion(cookies, token, expiraEn);
	}

	return { id: fila.id, nombre: fila.nombre, email: fila.email };
}

export async function cerrarSesion(d1: D1Database, cookies: Cookies) {
	const token = cookies.get(COOKIE_SESION);
	if (token) {
		await drizzle(d1)
			.delete(sesiones)
			.where(eq(sesiones.id, await sha256(token)));
	}
	cookies.delete(COOKIE_SESION, { path: '/' });
}
