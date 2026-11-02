<script>
	import { resolve } from '$app/paths';
	import StatusDial from '$lib/components/ui/StatusDial.svelte';
</script>

<StatusDial>
	<h1 class="mb-4 text-4xl font-bold text-red-600">❌ Pago no completado</h1>

	<p class="text-lg">La transacción fue cancelada o rechazada.</p>

	<h2 class="text-center text-xl font-bold">¿Hubo un problema con tu pago?</h2>
	<p>
		Si hubo un problema con tu pago recomendamos esperar 15 minutos para que se libere nuevamente el
		horario en la agenda.
	</p>

	<a
		href={resolve('/aplicacion/agenda')}
		class="mt-6 inline-block rounded bg-primary px-4 py-2 text-white"
	>
		Intentar nuevamente
	</a>
</StatusDial>
