import { drizzle } from 'drizzle-orm/d1';
import { and, eq } from 'drizzle-orm';
import { error, fail, redirect } from '@sveltejs/kit';
import { talleres, usuariosTalleres } from '$lib/server/db/schema';
import { renderMarkdown } from '$lib/markdown';
import {
	crearOrdenPayPal,
	crearPreferenciaMercadoPago,
	getBaseUrl,
	PagoError,
	paypalDisponible,
	PREFIJO_TALLER,
	type MetodoPago
} from '$lib/server/payments';

async function compraDe(
	d1: App.Platform['env']['therapist_db'],
	usuarioId: string,
	tallerId: string
) {
	const [compra] = await drizzle(d1)
		.select()
		.from(usuariosTalleres)
		.where(and(eq(usuariosTalleres.usuarioId, usuarioId), eq(usuariosTalleres.tallerId, tallerId)));
	return compra ?? null;
}

export const load = async ({ params, platform, locals, url }) => {
	const d1 = platform?.env?.therapist_db;
	if (!d1) error(500, 'Base de datos no conectada');

	const [taller] = await drizzle(d1).select().from(talleres).where(eq(talleres.id, params.id));
	const compra = taller && locals.usuario ? await compraDe(d1, locals.usuario.id, taller.id) : null;
	const comprado = compra?.estado === 'aprobado';

	// Un taller despublicado sigue visible para quien ya lo compró
	if (!taller || (!taller.publicado && !comprado)) error(404, 'Taller no encontrado');

	return {
		usuario: locals.usuario,
		taller: {
			id: taller.id,
			nombre: taller.nombre,
			precio: taller.precio,
			descripcion: taller.descripcion
		},
		comprado,
		// El contenido solo sale del servidor si el usuario tiene acceso
		contenidoHtml: comprado ? renderMarkdown(taller.contenido) : null,
		paypalHabilitado: paypalDisponible(platform?.env),
		resultadoCompra: url.searchParams.get('compra')
	};
};

export const actions = {
	comprar: async ({ params, platform, locals, request, url }) => {
		if (!locals.usuario) {
			redirect(303, `/auth/login?redirectTo=${encodeURIComponent(url.pathname)}`);
		}
		const d1 = platform?.env?.therapist_db;
		if (!d1) return fail(500, { error: 'Base de datos no conectada.' });
		const db = drizzle(d1);

		const [taller] = await db
			.select()
			.from(talleres)
			.where(and(eq(talleres.id, params.id), eq(talleres.publicado, true)));
		if (!taller) return fail(404, { error: 'Este taller no está disponible.' });

		const metodoPago: MetodoPago =
			(await request.formData()).get('metodoPago')?.toString() === 'paypal'
				? 'paypal'
				: 'mercadopago';

		const existente = await compraDe(d1, locals.usuario.id, taller.id);
		if (existente?.estado === 'aprobado') redirect(303, url.pathname);

		// Una fila por usuario + taller: se reutiliza en cada intento de pago
		const [compra] = await db
			.insert(usuariosTalleres)
			.values({ usuarioId: locals.usuario.id, tallerId: taller.id, estado: 'pendiente' })
			.onConflictDoUpdate({
				target: [usuariosTalleres.usuarioId, usuariosTalleres.tallerId],
				set: { estado: 'pendiente' }
			})
			.returning({ id: usuariosTalleres.id });

		const item = {
			id: taller.id,
			titulo: `Taller: ${taller.nombre}`,
			precioCop: taller.precio,
			tipo: 'taller' as const,
			referencia: `${PREFIJO_TALLER}${compra.id}`,
			nombre: locals.usuario.nombre,
			email: locals.usuario.email
		};

		let checkoutUrl: string;
		try {
			const baseUrl = getBaseUrl(url.origin, platform?.env);
			checkoutUrl =
				metodoPago === 'paypal'
					? await crearOrdenPayPal(item, baseUrl, platform?.env)
					: await crearPreferenciaMercadoPago(item, baseUrl, platform?.env);
		} catch (err) {
			console.error('Error creando pago de taller:', err);
			const msg = err instanceof PagoError ? err.message : 'Error con la pasarela de pagos.';
			return fail(502, { error: msg });
		}

		redirect(303, checkoutUrl);
	}
};
