<script lang="ts">
	import StatusDial from '$lib/components/ui/StatusDial.svelte';

	let { data } = $props();
</script>

<StatusDial>
	<h1 class="mb-4 text-4xl font-bold text-green-600">✅ Pago recibido</h1>

	{#if data.cita?.estadoPago === 'aprobado'}
		<p class="text-lg">Tu pago fue aprobado y tu cita ha sido confirmada.</p>
	{:else}
		<p class="text-lg">
			Hemos recibido el regreso de Mercado Pago y estamos verificando la transacción.
		</p>
	{/if}

	{#if data.cita}
		<div class="mt-6 rounded-lg border p-4 text-left">
			<p><strong>ID Cita:</strong> {data.cita.id}</p>
			<p><strong>Estado Cita:</strong> {data.cita.estadoCita}</p>
			<p><strong>Estado Pago:</strong> {data.cita.estadoPago}</p>
		</div>
	{/if}
</StatusDial>
