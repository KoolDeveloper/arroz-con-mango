import { json } from '@sveltejs/kit';
import { procesarPagoMercadoPago, readEnv } from '$lib/server/payments';

export const POST = async ({ request, platform, url }) => {
	const d1 = platform?.env?.therapist_db;
	const mpToken = readEnv('MP_ACCESS_TOKEN', platform?.env);
	if (!d1 || !mpToken) return json({ error: 'Configuración incompleta' }, { status: 500 });

	// Mercado Pago puede enviar el ID por query params o en el body JSON
	const body = await request.json().catch(() => ({}));
	const type = url.searchParams.get('type') || url.searchParams.get('topic') || body.type;
	const paymentId = url.searchParams.get('data.id') || url.searchParams.get('id') || body?.data?.id;

	// Solo procesamos eventos de tipo payment
	if (type !== 'payment' || !paymentId) {
		return json({ received: true });
	}

	// Se consulta la API de MP para verificar el pago (cita o taller según external_reference)
	try {
		await procesarPagoMercadoPago(d1, String(paymentId), platform?.env);
	} catch (err) {
		console.error('Error procesando webhook de MP:', err);
		return json({ error: 'No se pudo verificar el pago en MP' }, { status: 400 });
	}

	return json({ success: true });
};
