import { redirect } from '@sveltejs/kit';
import { parsearReferencia, precioDeCompra, procesarPagoMercadoPago } from '$lib/server/payments';

// Retorno de Mercado Pago (success / failure / pending) para compras de talleres.
// No confiamos en los query params: si hay payment_id lo verificamos contra la API de MP,
// así el acceso queda activo aunque el webhook todavía no haya llegado.
export async function GET({ url, platform }) {
	const d1 = platform?.env?.therapist_db;
	const paymentId = url.searchParams.get('payment_id') || url.searchParams.get('collection_id');
	const ref = parsearReferencia(url.searchParams.get('external_reference') ?? '');

	if (!d1 || ref.tipo !== 'taller') redirect(303, '/aplicacion/talleres');

	const compra = await precioDeCompra(d1, ref.compraId);
	if (!compra) redirect(303, '/aplicacion/talleres');

	// El usuario volvió sin pagar
	let estado: 'approved' | 'pending' | 'rejected' = 'rejected';

	if (paymentId && paymentId !== 'null') {
		estado = 'pending';
		try {
			const r = await procesarPagoMercadoPago(d1, paymentId, platform?.env);
			if (r?.status === 'approved') estado = 'approved';
			else if (r?.status === 'rejected' || r?.status === 'cancelled') estado = 'rejected';
		} catch (err) {
			console.error('Error verificando pago de taller en MP:', err);
		}
	}

	redirect(303, `/aplicacion/talleres/${compra.tallerId}?compra=${estado}`);
}
