<script>
import { resolve } from '$app/paths';
</script>

<div class="mx-auto max-w-2xl p-8 text-center">
	<h1 class="mb-4 text-4xl font-bold text-red-600">
		❌ Pago no completado
	</h1>

	<p class="text-lg">
		La transacción fue cancelada o rechazada.
	</p>

	<a
		href={resolve('/aplicacion/agenda')}
		class="mt-6 inline-block rounded bg-primary px-4 py-2 text-white"
	>
		Intentar nuevamente
	</a>
</div>