import { redirect } from '@sveltejs/kit';
import { consultarOrdenPayPal, liberarCita } from '$lib/server/payments';

// PayPal redirige aquí (?token=<ORDER_ID>) cuando el usuario cancela el pago.
export async function GET({ url, platform }) {
	const orderId = url.searchParams.get('token');
	const d1 = platform?.env?.therapist_db;

	if (orderId && d1) {
		try {
			const orden = await consultarOrdenPayPal(orderId, platform?.env);
			const citaId = orden.purchase_units?.[0]?.custom_id;
			// Solo liberamos si la orden realmente no se completó
			if (citaId && orden.status !== 'COMPLETED') await liberarCita(d1, citaId);
		} catch (err) {
			console.error('Error liberando cita cancelada en PayPal:', err);
		}
	}

	redirect(303, '/aplicacion/agenda/failure?provider=paypal');
}
