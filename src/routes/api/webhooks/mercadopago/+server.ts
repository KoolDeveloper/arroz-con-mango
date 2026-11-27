import { json } from '@sveltejs/kit';
import { readEnv, registrarResultadoPago } from '$lib/server/payments';

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

	await registrarResultadoPago(d1, {
		citaId,
		referencia: String(paymentData.id),
		monto: paymentData.transaction_amount,
		status: paymentData.status
	});

	return json({ success: true });
};
