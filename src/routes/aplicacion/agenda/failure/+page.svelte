<script lang="ts">
	import StatusDial from '$lib/components/ui/StatusDial.svelte';
</script>

<StatusDial>
	<p class="text-5xl">❌</p>
	<h1 class="text-4xl text-red-300">Pago no completado</h1>
	<p class="text-white/70">La transacción fue cancelada o rechazada.</p>
	<p class="text-sm text-white/50">
		Puedes intentarlo de nuevo con otro método de pago. Si el horario aparece ocupado, espera unos
		15 minutos a que se libere en la agenda.
	</p>
</StatusDial>
