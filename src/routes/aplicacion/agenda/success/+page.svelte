<script lang="ts">
	import StatusDial from '$lib/components/ui/StatusDial.svelte';

	let { data } = $props();
</script>

<StatusDial>
	<p class="text-5xl">✅</p>
	<h1 class="text-4xl text-secondary">Pago recibido</h1>

	{#if data.cita?.estadoPago === 'aprobado'}
		<p class="text-white/70">Tu pago fue aprobado y tu cita ha sido confirmada.</p>
	{:else}
		<p class="text-white/70">Recibimos tu pago y estamos verificando la transacción.</p>
	{/if}

	{#if data.cita}
		<dl
			class="mt-4 grid gap-2 rounded-2xl border border-white/10 bg-black/20 p-4 text-left text-sm"
		>
			<div class="flex justify-between gap-4">
				<dt class="text-white/50">Cita</dt>
				<dd class="font-mono text-xs">{data.cita.id.slice(0, 8)}</dd>
			</div>
			<div class="flex justify-between gap-4">
				<dt class="text-white/50">Estado de la cita</dt>
				<dd class="capitalize">{data.cita.estadoCita}</dd>
			</div>
			<div class="flex justify-between gap-4">
				<dt class="text-white/50">Estado del pago</dt>
				<dd class="capitalize">{data.cita.estadoPago}</dd>
			</div>
		</dl>
	{/if}
</StatusDial>
