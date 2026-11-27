<script lang="ts">
	import { formatearFecha } from '$lib/agenda/slots';
	import StepLabel from './StepLabel.svelte';

	type Props = { fechas: string[]; value: string; onselect: (fecha: string) => void };
	let { fechas, value, onselect }: Props = $props();
</script>

<fieldset>
	<StepLabel step={2}>Día</StepLabel>
	<div class="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-2">
		{#each fechas as fecha (fecha)}
			{@const f = formatearFecha(fecha)}
			{@const activo = fecha === value}
			<button
				type="button"
				aria-pressed={activo}
				aria-label={f.largo}
				onclick={() => onselect(fecha)}
				class="option-card flex min-w-18 shrink-0 snap-start flex-col items-center px-3 py-3
					{activo ? 'option-card-active' : ''}"
			>
				<span class="text-[10px] tracking-widest text-white/50 uppercase">{f.dia}</span>
				<span class="text-2xl leading-tight font-semibold text-white">{f.num}</span>
				<span class="text-[10px] tracking-widest text-white/50 uppercase">{f.mes}</span>
			</button>
		{/each}
	</div>
</fieldset>
