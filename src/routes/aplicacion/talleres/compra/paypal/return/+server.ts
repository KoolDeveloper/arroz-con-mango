import { error, redirect } from '@sveltejs/kit';
import {
	capturarOrdenPayPal,
	copToUsd,
	parsearReferencia,
	precioDeCompra,
	registrarPagoTaller
} from '$lib/server/payments';

// PayPal redirige aquí con ?token=<ORDER_ID> tras aprobar el pago de un taller.
export async function GET({ url, platform }) {
	const orderId = url.searchParams.get('token');
	if (!orderId) error(400, 'Falta la referencia de la orden de PayPal');

	const d1 = platform?.env?.therapist_db;
	if (!d1) error(500, 'Base de datos no disponible');

	const orden = await capturarOrdenPayPal(orderId, platform?.env);
	const unidad = orden.purchase_units?.[0];
	const ref = parsearReferencia(unidad?.custom_id ?? '');
	if (ref.tipo !== 'taller') error(400, 'La orden de PayPal no está asociada a ningún taller');

	const compra = await precioDeCompra(d1, ref.compraId);
	if (!compra) error(404, 'Compra no encontrada');

	const captura = unidad?.payments?.captures?.[0];
	const esperado = Number(copToUsd(compra.precio, platform?.env));
	const montoOk =
		captura?.amount.currency_code === 'USD' && Number(captura.amount.value) >= esperado - 0.01;

	let status = 'pending';
	if (orden.status === 'COMPLETED' && captura?.status === 'COMPLETED' && montoOk)
		status = 'approved';
	else if (captura?.status === 'DECLINED' || captura?.status === 'FAILED') status = 'rejected';

	await registrarPagoTaller(d1, {
		compraId: ref.compraId,
		referencia: `PAYPAL-${captura?.id ?? orden.id}`,
		monto: compra.precio,
		status
	});

	redirect(303, `/aplicacion/talleres/${compra.tallerId}?compra=${status}`);
}
