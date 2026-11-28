import { env } from '$env/dynamic/private';
import type { D1Database } from '@cloudflare/workers-types';
import { drizzle } from 'drizzle-orm/d1';
import { and, eq, ne } from 'drizzle-orm';
import { citas, franjas, pagos, talleres, usuariosTalleres } from '$lib/server/db/schema';

export type { MetodoPago } from '$lib/agenda/payment';

type PlatformEnv = Record<string, unknown> | undefined;

/** Lee una variable de entorno desde $env o desde los bindings de Cloudflare. */
export function readEnv(key: string, platformEnv?: PlatformEnv): string | undefined {
	const value = env[key] || (platformEnv?.[key] as string | undefined);
	return value?.trim() || undefined;
}

/** URL pública forzada a https (MP y PayPal exigen https en las URLs de retorno). */
export function getBaseUrl(origin: string, platformEnv?: PlatformEnv): string {
	const raw = readEnv('PUBLIC_URL', platformEnv) || origin;
	return raw.replace(/^http:\/\//, 'https://').replace(/\/$/, '');
}

// ───────────────────────── Mercado Pago ─────────────────────────

type ItemPago = {
	id: string;
	titulo: string;
	precioCop: number;
	/** Qué se está pagando: define las URLs de retorno */
	tipo: 'cita' | 'taller';
	/** external_reference (MP) / custom_id (PayPal). Citas: citaId; talleres: "taller:<compraId>" */
	referencia: string;
	nombre: string;
	email: string;
	/** Ventana de validez del checkout (solo citas: dura lo que el bloqueo de franjas) */
	desde?: number;
	hasta?: number;
};

export const PREFIJO_TALLER = 'taller:';

/** Interpreta la referencia externa de un pago: cita (UUID sin prefijo) o compra de taller. */
export function parsearReferencia(
	ref: string
): { tipo: 'cita'; citaId: string } | { tipo: 'taller'; compraId: string } {
	return ref.startsWith(PREFIJO_TALLER)
		? { tipo: 'taller', compraId: ref.slice(PREFIJO_TALLER.length) }
		: { tipo: 'cita', citaId: ref };
}

function rutasRetorno(tipo: ItemPago['tipo'], baseUrl: string) {
	if (tipo === 'taller') {
		const base = `${baseUrl}/aplicacion/talleres/compra`;
		return {
			mpSuccess: `${base}/mercadopago`,
			mpFailure: `${base}/mercadopago`,
			mpPending: `${base}/mercadopago`,
			paypalReturn: `${base}/paypal/return`,
			paypalCancel: `${base}/paypal/cancel`
		};
	}
	return {
		mpSuccess: `${baseUrl}/aplicacion/agenda/success`,
		mpFailure: `${baseUrl}/aplicacion/agenda/failure`,
		mpPending: `${baseUrl}/aplicacion/agenda/pending`,
		paypalReturn: `${baseUrl}/aplicacion/agenda/paypal/return`,
		paypalCancel: `${baseUrl}/aplicacion/agenda/paypal/cancel`
	};
}

export async function crearPreferenciaMercadoPago(
	item: ItemPago,
	baseUrl: string,
	platformEnv?: PlatformEnv
): Promise<string> {
	const token = readEnv('MP_ACCESS_TOKEN', platformEnv);
	if (!token) throw new PagoError('Falta configurar MP_ACCESS_TOKEN en el servidor.');

	const rutas = rutasRetorno(item.tipo, baseUrl);
	const ventana =
		item.desde && item.hasta
			? {
					expires: true,
					expiration_date_from: new Date(item.desde).toISOString(),
					expiration_date_to: new Date(item.hasta).toISOString()
				}
			: {};

	const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
		method: 'POST',
		headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
		body: JSON.stringify({
			items: [
				{
					id: item.id,
					title: item.titulo,
					quantity: 1,
					unit_price: item.precioCop,
					currency_id: 'COP'
				}
			],
			payer: { name: item.nombre, email: item.email },
			external_reference: item.referencia,
			back_urls: {
				success: rutas.mpSuccess,
				failure: rutas.mpFailure,
				pending: rutas.mpPending
			},
			auto_return: 'approved',
			notification_url: `${baseUrl}/api/webhooks/mercadopago`,
			...ventana
		})
	});

	if (!res.ok) {
		console.error('Error MP:', await res.text());
		throw new PagoError('Error al comunicarse con Mercado Pago.');
	}

	const data: { init_point?: string } = await res.json();
	if (!data.init_point) throw new PagoError('Mercado Pago no devolvió un enlace de pago.');
	return data.init_point;
}

// ───────────────────────── PayPal ─────────────────────────

function paypalApiBase(platformEnv?: PlatformEnv) {
	return readEnv('PAYPAL_ENV', platformEnv) === 'live'
		? 'https://api-m.paypal.com'
		: 'https://api-m.sandbox.paypal.com';
}

/** PayPal no acepta COP: convertimos usando PAYPAL_COP_USD_RATE (COP por 1 USD). */
export function copToUsd(precioCop: number, platformEnv?: PlatformEnv): string {
	const rate = Number(readEnv('PAYPAL_COP_USD_RATE', platformEnv));
	if (!rate || rate <= 0)
		throw new PagoError('Falta configurar PAYPAL_COP_USD_RATE en el servidor.');
	return (Math.ceil((precioCop / rate) * 100) / 100).toFixed(2);
}

export function paypalDisponible(platformEnv?: PlatformEnv): boolean {
	return Boolean(
		readEnv('PAYPAL_CLIENT_ID', platformEnv) &&
		readEnv('PAYPAL_CLIENT_SECRET', platformEnv) &&
		Number(readEnv('PAYPAL_COP_USD_RATE', platformEnv)) > 0
	);
}

async function paypalToken(platformEnv?: PlatformEnv): Promise<string> {
	const clientId = readEnv('PAYPAL_CLIENT_ID', platformEnv);
	const secret = readEnv('PAYPAL_CLIENT_SECRET', platformEnv);
	if (!clientId || !secret) {
		throw new PagoError('Falta configurar PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET en el servidor.');
	}

	const res = await fetch(`${paypalApiBase(platformEnv)}/v1/oauth2/token`, {
		method: 'POST',
		headers: {
			Authorization: `Basic ${btoa(`${clientId}:${secret}`)}`,
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: 'grant_type=client_credentials'
	});
	if (!res.ok) {
		console.error('Error PayPal OAuth:', await res.text());
		throw new PagoError('No se pudo autenticar con PayPal.');
	}
	const data: { access_token: string } = await res.json();
	return data.access_token;
}

export async function crearOrdenPayPal(
	item: ItemPago,
	baseUrl: string,
	platformEnv?: PlatformEnv
): Promise<string> {
	const valueUsd = copToUsd(item.precioCop, platformEnv);
	const token = await paypalToken(platformEnv);
	const rutas = rutasRetorno(item.tipo, baseUrl);
	// Cada cita es un intento nuevo; una compra de taller se reintenta con la misma referencia
	const requestId = item.tipo === 'cita' ? item.referencia : crypto.randomUUID();

	const res = await fetch(`${paypalApiBase(platformEnv)}/v2/checkout/orders`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
			'PayPal-Request-Id': requestId // idempotencia
		},
		body: JSON.stringify({
			intent: 'CAPTURE',
			purchase_units: [
				{
					reference_id: item.id,
					custom_id: item.referencia,
					description: item.titulo.slice(0, 127),
					amount: { currency_code: 'USD', value: valueUsd }
				}
			],
			payment_source: {
				paypal: {
					email_address: item.email,
					experience_context: {
						brand_name: 'Alejo Mentor',
						locale: 'es-ES',
						shipping_preference: 'NO_SHIPPING',
						user_action: 'PAY_NOW',
						return_url: rutas.paypalReturn,
						cancel_url: rutas.paypalCancel
					}
				}
			}
		})
	});

	if (!res.ok) {
		console.error('Error PayPal orden:', await res.text());
		throw new PagoError('Error al comunicarse con PayPal.');
	}

	const data: { links?: { rel: string; href: string }[] } = await res.json();
	const link = data.links?.find((l) => l.rel === 'payer-action' || l.rel === 'approve');
	if (!link) throw new PagoError('PayPal no devolvió un enlace de pago.');
	return link.href;
}

type OrdenPayPal = {
	id: string;
	status: string;
	purchase_units?: {
		custom_id?: string;
		payments?: {
			captures?: { id: string; status: string; amount: { value: string; currency_code: string } }[];
		};
	}[];
};

async function obtenerOrdenPayPal(orderId: string, token: string, platformEnv?: PlatformEnv) {
	const res = await fetch(
		`${paypalApiBase(platformEnv)}/v2/checkout/orders/${encodeURIComponent(orderId)}`,
		{
			headers: { Authorization: `Bearer ${token}` }
		}
	);
	if (!res.ok) throw new PagoError('No se pudo consultar la orden en PayPal.');
	return (await res.json()) as OrdenPayPal;
}

/** Captura la orden (idempotente: si ya fue capturada, solo la consulta). */
export async function capturarOrdenPayPal(orderId: string, platformEnv?: PlatformEnv) {
	const token = await paypalToken(platformEnv);
	const res = await fetch(
		`${paypalApiBase(platformEnv)}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
		{
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
				'PayPal-Request-Id': `capture-${orderId}`
			}
		}
	);

	if (res.ok) return (await res.json()) as OrdenPayPal;

	const errText = await res.text();
	if (errText.includes('ORDER_ALREADY_CAPTURED')) {
		return obtenerOrdenPayPal(orderId, token, platformEnv);
	}
	console.error('Error PayPal captura:', errText);
	// Si la captura falla (p.ej. fondos rechazados) devolvemos el estado actual de la orden
	return obtenerOrdenPayPal(orderId, token, platformEnv);
}

export async function consultarOrdenPayPal(orderId: string, platformEnv?: PlatformEnv) {
	const token = await paypalToken(platformEnv);
	return obtenerOrdenPayPal(orderId, token, platformEnv);
}

// ───────────────────────── Persistencia común ─────────────────────────

type ResultadoPago = {
	citaId: string;
	referencia: string; // ID de MP, o "PAYPAL-<captureId>"
	monto: number; // en COP
	status: string; // approved | rejected | cancelled | pending ...
};

/** Registra el pago y actualiza cita + franjas según el estado. */
export async function registrarResultadoPago(d1: D1Database, r: ResultadoPago) {
	const db = drizzle(d1);

	await db
		.insert(pagos)
		.values({
			citaId: r.citaId,
			mercadoPagoId: r.referencia,
			amount: Math.round(r.monto),
			status: r.status
		})
		.onConflictDoUpdate({ target: pagos.mercadoPagoId, set: { status: r.status } });

	if (r.status === 'approved') {
		await db.batch([
			db
				.update(citas)
				.set({ estadoCita: 'confirmada', estadoPago: 'aprobado' })
				.where(eq(citas.id, r.citaId)),
			db
				.update(franjas)
				.set({ available: false, lockedUntil: null })
				.where(eq(franjas.citaId, r.citaId))
		]);
	} else if (r.status === 'rejected' || r.status === 'cancelled') {
		await liberarCita(d1, r.citaId);
	}
}

/** Libera las franjas bloqueadas de una cita que no se pagó. */
export async function liberarCita(d1: D1Database, citaId: string) {
	const db = drizzle(d1);
	const [cita] = await db.select().from(citas).where(eq(citas.id, citaId));
	if (!cita || cita.estadoPago === 'aprobado') return;

	await db.batch([
		db.update(citas).set({ estadoPago: 'rechazado' }).where(eq(citas.id, citaId)),
		db
			.update(franjas)
			.set({ available: true, lockedUntil: null, citaId: null })
			.where(eq(franjas.citaId, citaId))
	]);
}

// ───────────────────────── Talleres ─────────────────────────

type ResultadoPagoTaller = {
	compraId: string;
	referencia: string; // ID de MP, o "PAYPAL-<captureId>"
	monto: number; // en COP
	status: string;
};

/** Registra el pago de un taller y, si se aprobó, da acceso al usuario. */
export async function registrarPagoTaller(d1: D1Database, r: ResultadoPagoTaller) {
	const db = drizzle(d1);

	await db
		.insert(pagos)
		.values({
			compraTallerId: r.compraId,
			mercadoPagoId: r.referencia,
			amount: Math.round(r.monto),
			status: r.status
		})
		.onConflictDoUpdate({ target: pagos.mercadoPagoId, set: { status: r.status } });

	if (r.status === 'approved') {
		await db
			.update(usuariosTalleres)
			.set({ estado: 'aprobado', aprobadoEn: new Date() })
			.where(eq(usuariosTalleres.id, r.compraId));
	} else if (r.status === 'rejected' || r.status === 'cancelled') {
		// Nunca quitamos un acceso ya aprobado por un intento fallido posterior
		await db
			.update(usuariosTalleres)
			.set({ estado: 'rechazado' })
			.where(and(eq(usuariosTalleres.id, r.compraId), ne(usuariosTalleres.estado, 'aprobado')));
	}
}

/** Precio actual del taller de una compra (para validar el monto pagado). */
export async function precioDeCompra(d1: D1Database, compraId: string) {
	const [fila] = await drizzle(d1)
		.select({ precio: talleres.precio, tallerId: talleres.id })
		.from(usuariosTalleres)
		.innerJoin(talleres, eq(usuariosTalleres.tallerId, talleres.id))
		.where(eq(usuariosTalleres.id, compraId));
	return fila ?? null;
}

// ───────────────────────── Mercado Pago: verificación ─────────────────────────

type PagoMercadoPago = {
	id: number;
	status: string;
	transaction_amount: number;
	currency_id?: string;
	external_reference?: string;
};

/**
 * Consulta un pago en la API de MP (fuente de verdad, nunca los query params) y lo registra
 * como cita o taller según su external_reference. Usado por el webhook y por el retorno.
 */
export async function procesarPagoMercadoPago(
	d1: D1Database,
	paymentId: string,
	platformEnv?: PlatformEnv
) {
	const token = readEnv('MP_ACCESS_TOKEN', platformEnv);
	if (!token) throw new PagoError('Falta configurar MP_ACCESS_TOKEN en el servidor.');

	const res = await fetch(
		`https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`,
		{
			headers: { Authorization: `Bearer ${token}` }
		}
	);
	if (!res.ok) throw new PagoError('No se pudo verificar el pago en Mercado Pago.');

	const pago: PagoMercadoPago = await res.json();
	if (!pago.external_reference) return null;

	const ref = parsearReferencia(pago.external_reference);

	if (ref.tipo === 'cita') {
		await registrarResultadoPago(d1, {
			citaId: ref.citaId,
			referencia: String(pago.id),
			monto: pago.transaction_amount,
			status: pago.status
		});
		return { ...ref, status: pago.status };
	}

	const compra = await precioDeCompra(d1, ref.compraId);
	if (!compra) return null;

	let status = pago.status;
	if (
		status === 'approved' &&
		(pago.currency_id !== 'COP' || pago.transaction_amount < compra.precio)
	) {
		console.error('Monto de MP no coincide con el precio del taller', pago, compra);
		status = 'monto_invalido';
	}

	await registrarPagoTaller(d1, {
		compraId: ref.compraId,
		referencia: String(pago.id),
		monto: pago.transaction_amount,
		status
	});
	return { ...ref, tallerId: compra.tallerId, status };
}

export class PagoError extends Error {}
