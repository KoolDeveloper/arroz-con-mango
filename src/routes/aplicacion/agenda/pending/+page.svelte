<script lang="ts">
	import StatusDial from '$lib/components/ui/StatusDial.svelte';
</script>

<StatusDial>
		<h1 class="mb-4 text-4xl font-bold text-yellow-600">⏳ Pago pendiente</h1>

		<p class="text-lg">Estamos esperando la confirmación de Mercado Pago.</p>

		<p class="mt-3 text-sm text-gray-600">
			Recibirás la confirmación una vez que el pago sea procesado.
		</p>
</StatusDial>
