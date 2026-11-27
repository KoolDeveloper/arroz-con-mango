<script lang="ts">
	import { page } from '$app/state';
	import StatusDial from '$lib/components/ui/StatusDial.svelte';

	const proveedor = $derived(
		page.url.searchParams.get('provider') === 'paypal' ? 'PayPal' : 'Mercado Pago'
	);
</script>

<StatusDial>
	<p class="text-5xl">⏳</p>
	<h1 class="text-4xl text-yellow-300">Pago pendiente</h1>
	<p class="text-white/70">Estamos esperando la confirmación de {proveedor}.</p>
	<p class="text-sm text-white/50">Recibirás la confirmación una vez que el pago sea procesado.</p>
</StatusDial>
