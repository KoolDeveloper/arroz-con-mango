import { error, redirect } from '@sveltejs/kit';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { citas, tiposCita } from '$lib/server/db/schema';
import { capturarOrdenPayPal, copToUsd, registrarResultadoPago } from '$lib/server/payments';

// PayPal redirige aquí con ?token=<ORDER_ID> tras aprobar el pago.
export async function GET({ url, platform }) {
	const orderId = url.searchParams.get('token');
	if (!orderId) error(400, 'Falta la referencia de la orden de PayPal');

	const d1 = platform?.env?.therapist_db;
	if (!d1) error(500, 'Base de datos no disponible');

	const orden = await capturarOrdenPayPal(orderId, platform?.env);
	const unidad = orden.purchase_units?.[0];
	const citaId = unidad?.custom_id;
	if (!citaId) error(400, 'La orden de PayPal no está asociada a ninguna cita');

	const db = drizzle(d1);
	const [fila] = await db
		.select({ precio: tiposCita.precio })
		.from(citas)
		.innerJoin(tiposCita, eq(citas.tipoCitaId, tiposCita.id))
		.where(eq(citas.id, citaId));
	if (!fila) error(404, 'Cita no encontrada');

	const captura = unidad.payments?.captures?.[0];
	const esperado = Number(copToUsd(fila.precio, platform?.env));
	const montoOk =
		captura?.amount.currency_code === 'USD' && Number(captura.amount.value) >= esperado - 0.01;

	let status = 'pending';
	if (orden.status === 'COMPLETED' && captura?.status === 'COMPLETED' && montoOk)
		status = 'approved';
	else if (captura?.status === 'DECLINED' || captura?.status === 'FAILED') status = 'rejected';

	await registrarResultadoPago(d1, {
		citaId,
		referencia: `PAYPAL-${captura?.id ?? orden.id}`,
		monto: fila.precio,
		status
	});

	const destino = status === 'approved' ? 'success' : status === 'rejected' ? 'failure' : 'pending';
	redirect(303, `/aplicacion/agenda/${destino}?external_reference=${citaId}&provider=paypal`);
}
