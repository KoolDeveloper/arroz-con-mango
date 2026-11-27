<script lang="ts">
	import type { Bloque } from '$lib/agenda/slots';
	import StepLabel from './StepLabel.svelte';

	type Props = { bloques: Bloque[]; duracion: number; onselect: (bloque: Bloque) => void };
	let { bloques, duracion, onselect }: Props = $props();
</script>

<fieldset>
	<StepLabel step={3}>Hora</StepLabel>
	{#if bloques.length === 0}
		<p class="rounded-2xl bg-white/5 px-4 py-3 text-sm text-white/60">
			No hay bloques consecutivos suficientes ({duracion}h) para este servicio en esta fecha.
		</p>
	{:else}
		<div class="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
			{#each bloques as bloque (bloque.ids.join('-'))}
				<button
					type="button"
					onclick={() => onselect(bloque)}
					class="option-card py-2.5 text-center text-sm font-medium text-white"
				>
					{bloque.startTime} – {bloque.endTime}
				</button>
			{/each}
		</div>
	{/if}
</fieldset>
