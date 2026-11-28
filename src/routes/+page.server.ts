import { drizzle } from 'drizzle-orm/d1';
import { eq, and, or, isNull, lt, gt, inArray, asc, desc } from 'drizzle-orm';
import { franjas, tiposCita, usuarios, citas, talleres } from '$lib/server/db/schema';
import { fail, redirect } from '@sveltejs/kit';
import {
	crearOrdenPayPal,
	crearPreferenciaMercadoPago,
	getBaseUrl,
	liberarCita,
	PagoError,
	paypalDisponible,
	type MetodoPago
} from '$lib/server/payments';

export const load = async ({ platform }) => {
	const d1 = platform?.env?.therapist_db;
	if (!d1) throw new Error('Base de datos no conectada');

	const db = drizzle(d1);
	const ahora = Date.now();

	// Obtener la fecha actual ('YYYY-MM-DD') en la zona horaria local (Colombia)
	const fechaActualStr = new Intl.DateTimeFormat('en-CA', {
		timeZone: 'America/Bogota'
	}).format(new Date());

	// Obtener la hora actual ('HH:mm') en la zona horaria local (Colombia)
	const horaActualStr = new Intl.DateTimeFormat('en-GB', {
		timeZone: 'America/Bogota',
		hour: '2-digit',
		minute: '2-digit',
		hour12: false
	}).format(new Date());

	const [franjasDisponibles, serviciosActivos, talleresDestacados] = await Promise.all([
		db
			.select()
			.from(franjas)
			.where(
				and(
					eq(franjas.available, true),
					or(isNull(franjas.lockedUntil), lt(franjas.lockedUntil, ahora)),
					// Filtro de tiempo: Fechas futuras o el día de hoy con hora posterior a la actual
					or(
						gt(franjas.date, fechaActualStr),
						and(eq(franjas.date, fechaActualStr), gt(franjas.startTime, horaActualStr))
					)
				)
			)
			.orderBy(asc(franjas.date), asc(franjas.startTime)),
		db.select().from(tiposCita).where(eq(tiposCita.activo, true)),
		// Vitrina de la landing: solo 3 filas y las columnas que se muestran (nunca el contenido)
		db
			.select({
				id: talleres.id,
				nombre: talleres.nombre,
				precio: talleres.precio,
				descripcion: talleres.descripcion
			})
			.from(talleres)
			.where(eq(talleres.publicado, true))
			.orderBy(desc(talleres.creadoEn))
			.limit(3)
	]);

	return {
		franjas: franjasDisponibles,
		tiposCita: serviciosActivos,
		talleres: talleresDestacados,
		paypalHabilitado: paypalDisponible(platform?.env)
	};
};

export const actions = {
	reservar: async ({ request, platform, url }) => {
		const d1 = platform?.env?.therapist_db;
		if (!d1) return fail(500, { error: 'Base de datos no conectada.' });
		const db = drizzle(d1);

		const formData = await request.formData();
		const franjasIdsRaw = formData.get('franjasIds')?.toString();
		const tipoCitaId = formData.get('tipoCitaId')?.toString();
		const nombre = formData.get('nombre')?.toString()?.trim();
		const email = formData.get('email')?.toString()?.trim().toLowerCase();
		const indicativo = formData.get('indicativo')?.toString()?.trim() || '+57';
		const numLocal = formData.get('telefono')?.toString()?.trim();
		const telefono = indicativo + numLocal;
		const notasCliente = formData.get('notasCliente')?.toString()?.trim() || null;
		const metodoPago: MetodoPago =
			formData.get('metodoPago')?.toString() === 'paypal' ? 'paypal' : 'mercadopago';

		const telefonoRegex = /^\+?[0-9\s-]{7,15}$/;
		if (!telefono || !telefonoRegex.test(telefono)) {
			return fail(400, { error: 'Por favor ingresa un número de teléfono válido.' });
		}

		if (!franjasIdsRaw || !tipoCitaId || !nombre || !email || !telefono) {
			return fail(400, { error: 'Por favor completa todos tus datos de contacto.' });
		}

		let franjasIds: string[];
		try {
			franjasIds = JSON.parse(franjasIdsRaw);
		} catch {
			return fail(400, { error: 'Formato de horario inválido.' });
		}

		if (franjasIds.length === 0) {
			return fail(400, { error: 'Debes seleccionar un horario válido.' });
		}

		const ahora = Date.now();

		try {
			// 1. Verificar tipo de cita y precio
			const [servicio] = await db
				.select()
				.from(tiposCita)
				.where(and(eq(tiposCita.id, tipoCitaId), eq(tiposCita.activo, true)));

			if (!servicio || franjasIds.length !== servicio.duracionFranjas) {
				return fail(400, { error: 'El tipo de cita seleccionado no coincide con los bloques.' });
			}

			// 2. Verificar disponibilidad de franjas
			const franjasEnDb = await db
				.select()
				.from(franjas)
				.where(
					and(
						inArray(franjas.id, franjasIds),
						eq(franjas.available, true),
						or(isNull(franjas.lockedUntil), lt(franjas.lockedUntil, ahora))
					)
				);

			if (franjasEnDb.length !== franjasIds.length) {
				return fail(409, { error: 'Este horario acaba de ser ocupado. Elige otro.' });
			}

			// 3. Upsert del Paciente
			const [paciente] = await db
				.insert(usuarios)
				.values({ nombre, email, telefono })
				.onConflictDoUpdate({
					target: usuarios.email,
					set: { nombre, telefono }
				})
				.returning({ id: usuarios.id });

			// 4. Crear Cita y Bloquear Franjas (15 minutos)
			const nuevaCitaId = crypto.randomUUID();
			const bloqueoHasta = ahora + 15 * 60 * 1000;

			await db.batch([
				db.insert(citas).values({
					id: nuevaCitaId,
					usuarioId: paciente.id,
					tipoCitaId: servicio.id,
					estadoCita: 'pendiente',
					estadoPago: 'pendiente',
					notasCliente
				}),
				db
					.update(franjas)
					.set({ lockedUntil: bloqueoHasta, citaId: nuevaCitaId })
					.where(inArray(franjas.id, franjasIds))
			]);

			// 5. Crear el pago con la pasarela elegida
			const baseUrl = getBaseUrl(url.origin, platform?.env);
			const item = {
				id: servicio.id,
				titulo: `${servicio.nombre} (${franjasEnDb[0].date} ${franjasEnDb[0].startTime})`,
				precioCop: servicio.precio,
				tipo: 'cita' as const,
				referencia: nuevaCitaId,
				nombre,
				email,
				desde: ahora,
				hasta: bloqueoHasta
			};

			let checkoutUrl: string;
			try {
				checkoutUrl =
					metodoPago === 'paypal'
						? await crearOrdenPayPal(item, baseUrl, platform?.env)
						: await crearPreferenciaMercadoPago(item, baseUrl, platform?.env);
			} catch (err) {
				// Revertir bloqueo si la pasarela falla
				await liberarCita(d1, nuevaCitaId);
				console.error('Error creando pago:', err);
				const msg = err instanceof PagoError ? err.message : 'Error con la pasarela de pagos.';
				return fail(502, { error: msg });
			}

			// 6. Redirección oficial
			redirect(303, checkoutUrl);
		} catch (err) {
			// Evita que un error inesperado cuelgue la UI sin dar respuesta
			if (err && typeof err === 'object' && 'status' in err && err.status === 303) {
				throw err; // Deja pasar la redirección de SvelteKit
			}
			console.error('Excepción en reservar:', err);
			return fail(500, { error: 'Ocurrió un error interno al procesar tu reserva.' });
		}
	}
};
