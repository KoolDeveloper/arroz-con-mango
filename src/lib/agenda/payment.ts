export type MetodoPago = 'mercadopago' | 'paypal';

export const NOMBRE_METODO: Record<MetodoPago, string> = {
	mercadopago: 'Mercado Pago',
	paypal: 'PayPal'
};

/** Mercado Pago para Colombia (+57), PayPal para el exterior (si está habilitado). */
export function sugerirMetodo(indicativo: string, paypalHabilitado: boolean): MetodoPago {
	return paypalHabilitado && indicativo !== '+57' ? 'paypal' : 'mercadopago';
}
