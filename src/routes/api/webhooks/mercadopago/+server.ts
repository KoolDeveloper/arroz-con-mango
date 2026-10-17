import { json } from '@sveltejs/kit';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { citas, franjas, pagos } from '$lib/server/db/schema';
import { env } from '$env/dynamic/private';

export const POST = async ({ request, platform, url }) => {
	const d1 = platform?.env?.therapist_db;
	const mpToken = env.MP_ACCESS_TOKEN;
	if (!d1 || !mpToken) return json({ error: 'Configuración incompleta' }, { status: 500 });

	// Mercado Pago puede enviar el ID por query params o en el body JSON
	const body = await request.json().catch(() => ({}));
	const type = url.searchParams.get('type') || url.searchParams.get('topic') || body.type;
	const paymentId = url.searchParams.get('data.id') || url.searchParams.get('id') || body?.data?.id;

	// Solo procesamos eventos de tipo payment
	if (type !== 'payment' || !paymentId) {
		return json({ received: true });
	}

	// Consultamos la API de Mercado Pago para verificar que el pago sea auténtico
	const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
		headers: { Authorization: `Bearer ${mpToken}` }
	});

	if (!mpRes.ok) {
		return json({ error: 'No se pudo verificar el pago en MP' }, { status: 400 });
	}

	const paymentData: {
		id: number;
		status: string;
		transaction_amount: number;
		external_reference?: string;
	} = await mpRes.json();

	const citaId = paymentData.external_reference;
	if (!citaId) return json({ received: true });

	const db = drizzle(d1);
	const mpIdString = String(paymentData.id);

	// 1. Registrar o actualizar el pago en la tabla 'pagos'
	await db
		.insert(pagos)
		.values({
			citaId,
			mercadoPagoId: mpIdString,
			amount: Math.round(paymentData.transaction_amount),
			status: paymentData.status
		})
		.onConflictDoUpdate({
			target: pagos.mercadoPagoId,
			set: { status: paymentData.status }
		});

	// 2. Si el pago fue aprobado, confirmamos la cita y cerramos las franjas definitivamente
	if (paymentData.status === 'approved') {
		await db.batch([
			db
				.update(citas)
				.set({ estadoCita: 'confirmada', estadoPago: 'aprobado' })
				.where(eq(citas.id, citaId)),
			db
				.update(franjas)
				.set({ available: false, lockedUntil: null })
				.where(eq(franjas.citaId, citaId))
		]);
	} else if (paymentData.status === 'rejected' || paymentData.status === 'cancelled') {
		// Si fue rechazado o cancelado, liberamos las franjas de inmediato
		await db.batch([
			db.update(citas).set({ estadoPago: 'rechazado' }).where(eq(citas.id, citaId)),
			db
				.update(franjas)
				.set({ available: true, lockedUntil: null, citaId: null })
				.where(eq(franjas.citaId, citaId))
		]);
	}

	return json({ success: true });
};
