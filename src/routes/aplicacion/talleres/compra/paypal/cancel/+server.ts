import { isRedirect, redirect } from '@sveltejs/kit';
import { consultarOrdenPayPal, parsearReferencia, precioDeCompra } from '$lib/server/payments';

// PayPal redirige aquí (?token=<ORDER_ID>) cuando el usuario cancela el pago de un taller.
export async function GET({ url, platform }) {
	const orderId = url.searchParams.get('token');
	const d1 = platform?.env?.therapist_db;

	if (orderId && d1) {
		try {
			const orden = await consultarOrdenPayPal(orderId, platform?.env);
			const ref = parsearReferencia(orden.purchase_units?.[0]?.custom_id ?? '');
			if (ref.tipo === 'taller') {
				const compra = await precioDeCompra(d1, ref.compraId);
				if (compra) redirect(303, `/aplicacion/talleres/${compra.tallerId}?compra=rejected`);
			}
		} catch (err) {
			if (isRedirect(err)) throw err;
			console.error('Error consultando orden cancelada de PayPal:', err);
		}
	}

	redirect(303, '/aplicacion/talleres');
}
