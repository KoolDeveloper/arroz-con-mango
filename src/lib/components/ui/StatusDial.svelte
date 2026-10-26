<script>
	import { resolve } from '$app/paths';
	import Icon from '@iconify/svelte';
	import whatsapp from '@iconify-icons/arcticons/whatsapp';

	const { children } = $props();
</script>

<div class="mx-auto max-w-2xl p-8 text-center">

	{@render children()}

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
