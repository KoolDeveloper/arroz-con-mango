<script lang="ts">
	import { resolve } from '$app/paths';
	import Icon from '@iconify/svelte';
	import whatsapp from '@iconify-icons/arcticons/whatsapp';

	let { data } = $props();
</script>

<div class="mx-auto max-w-2xl p-8 text-center">
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

	<section class="mt-6 grid items-center justify-center gap-4 rounded-lg border p-4 text-left">
		<h2>¿Tienes alguna pregunta?</h2>
		<p>Si tienes alguna pregunta sobre tu cita o el pago, no dudes en ponerte en contacto:</p>
		<div class="flex items-center justify-center">
			<a
				href="https://wa.me/573028023341"
				target="_blank"
				rel="noopener noreferrer"
				class="rounded-full bg-green-500 p-2 text-white hover:bg-green-600"
			>
				<Icon icon={whatsapp} width="40" height="40" />
			</a>
		</div>
	</section>

	<a
		class="w-fit rounded-lg bg-primary px-6 py-3 text-xl font-semibold text-white uppercase transition-colors hover:bg-primary/90"
		href={resolve('/')}
	>
		Volver al Inicio
	</a>
</div>
