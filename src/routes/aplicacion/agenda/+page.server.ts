import { drizzle } from 'drizzle-orm/d1';
import { eq, and, or, isNull, lt, gt, inArray, asc } from 'drizzle-orm';
import { franjas, tiposCita, pacientes, citas } from '$lib/server/db/schema';
import { fail, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

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

    const [franjasDisponibles, serviciosActivos] = await Promise.all([
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
                        and(
                            eq(franjas.date, fechaActualStr),
                            gt(franjas.startTime, horaActualStr)
                        )
                    )
                )
            )
            .orderBy(asc(franjas.date), asc(franjas.startTime)),
        db.select().from(tiposCita).where(eq(tiposCita.activo, true))
    ]);

    return {
        franjas: franjasDisponibles,
        tiposCita: serviciosActivos
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
				.insert(pacientes)
				.values({ nombre, email, telefono })
				.onConflictDoUpdate({
					target: pacientes.email,
					set: { nombre, telefono }
				})
				.returning({ id: pacientes.id });

			// 4. Crear Cita y Bloquear Franjas (15 minutos)
			const nuevaCitaId = crypto.randomUUID();
			const bloqueoHasta = ahora + 15 * 60 * 1000;

			await db.batch([
				db.insert(citas).values({
					id: nuevaCitaId,
					pacienteId: paciente.id,
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

			// 5. Petición a Mercado Pago
			const mpToken = env.MP_ACCESS_TOKEN || platform?.env?.MP_ACCESS_TOKEN;
			if (!mpToken) {
				return fail(500, { error: 'Falta configurar el token de Mercado Pago en el servidor.' });
			}

			const rawUrl = env.PUBLIC_URL || platform?.env?.PUBLIC_URL || url.origin;
			const baseUrl = rawUrl.startsWith('http://') ? rawUrl.replace('http://', 'https://') : rawUrl;

			console.log(baseUrl, 'baseUrl');

			const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${mpToken}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					items: [
						{
							id: servicio.id,
							title: `${servicio.nombre} (${franjasEnDb[0].date} ${franjasEnDb[0].startTime})`,
							quantity: 1,
							unit_price: servicio.precio,
							currency_id: 'COP'
						}
					],
					payer: { name: nombre, email: email },
					external_reference: nuevaCitaId,
					back_urls: {
						success: `${baseUrl}/aplicacion/agenda/success`,
						failure: `${baseUrl}/aplicacion/agenda/failure`,
						pending: `${baseUrl}/aplicacion/agenda/pending`
					},
					auto_return: 'approved',
					notification_url: `${baseUrl}/api/webhooks/mercadopago`,
					expires: true,
					expiration_date_from: new Date(ahora).toISOString(),
					expiration_date_to: new Date(bloqueoHasta).toISOString()
				})
			});

			if (!mpResponse.ok) {
				// Revertir bloqueo si MP falla
				await db
					.update(franjas)
					.set({ lockedUntil: null, citaId: null })
					.where(inArray(franjas.id, franjasIds));

				const errDetails = await mpResponse.text();
				console.error('Error MP:', errDetails);
				return fail(502, { error: 'Error al comunicarse con la pasarela de pagos.' });
			}

			const mpData: { init_point?: string } = await mpResponse.json();
			if (!mpData.init_point) {
				return fail(502, { error: 'No se obtuvo el punto de inicio de pago.' });
			}

			// 6. Redirección oficial
			redirect(303, mpData.init_point);
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
