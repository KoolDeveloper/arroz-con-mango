<script lang="ts">
	import { enhance } from '$app/forms';
	import type { TipoCitaSelect } from '$lib/server/db/schema';
	import { formatearPrecio, type Bloque } from '$lib/agenda/slots';
	import { NOMBRE_METODO, sugerirMetodo, type MetodoPago } from '$lib/agenda/payment';
	import ContactFields from './ContactFields.svelte';
	import PaymentMethodPicker from './PaymentMethodPicker.svelte';

	type Props = { servicio: TipoCitaSelect; bloque: Bloque; paypalHabilitado: boolean };
	let { servicio, bloque, paypalHabilitado }: Props = $props();

	let enviando = $state(false);
	let indicativo = $state('+57');
	// El método se sugiere por el indicativo hasta que el usuario elige uno manualmente
	let metodoManual = $state<MetodoPago | null>(null);
	const metodoPago = $derived(
		paypalHabilitado && metodoManual ? metodoManual : sugerirMetodo(indicativo, paypalHabilitado)
	);
</script>

<form
	method="POST"
	action="?/reservar"
	use:enhance={() => {
		enviando = true;
		return async ({ update }) => {
			await update();
			enviando = false;
		};
	}}
>
	<input type="hidden" name="franjasIds" value={JSON.stringify(bloque.ids)} />
	<input type="hidden" name="tipoCitaId" value={servicio.id} />

	<ContactFields bind:indicativo />

	<div class="mt-8">
		<PaymentMethodPicker
			value={metodoPago}
			{paypalHabilitado}
			onselect={(m) => (metodoManual = m)}
		/>
	</div>

	<button
		type="submit"
		disabled={enviando}
		class="mt-8 w-full rounded-full bg-accent py-4 font-semibold text-black shadow-[0_10px_40px_-10px_rgba(255,172,31,0.6)] transition hover:-translate-y-0.5 hover:bg-white disabled:translate-y-0 disabled:opacity-50"
	>
		{#if enviando}
			Redirigiendo a {NOMBRE_METODO[metodoPago]}…
		{:else}
			Pagar {formatearPrecio(servicio.precio)} con {NOMBRE_METODO[metodoPago]}
		{/if}
	</button>
	<p class="mt-3 text-center text-xs text-white/40">
		Tu horario queda reservado durante 15 minutos mientras completas el pago.
	</p>
</form>
