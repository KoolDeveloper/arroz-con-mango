<script lang="ts">
	import type { TipoCitaSelect } from '$lib/server/db/schema';
	import { formatearPrecio } from '$lib/formato';
	import StepLabel from './StepLabel.svelte';

	type Props = { tipos: TipoCitaSelect[]; value: string; onselect: (id: string) => void };
	let { tipos, value, onselect }: Props = $props();
</script>

<fieldset>
	<StepLabel step={1}>Tipo de sesión</StepLabel>
	<div class="grid gap-3 sm:grid-cols-2">
		{#each tipos as tipo (tipo.id)}
			{@const activo = tipo.id === value}
			<button
				type="button"
				aria-pressed={activo}
				onclick={() => onselect(tipo.id)}
				class="option-card text-left {activo ? 'option-card-active' : ''}"
			>
				<span class="flex items-start justify-between gap-3">
					<span class="font-semibold text-white">{tipo.nombre}</span>
					<span class="shrink-0 font-semibold text-accent">{formatearPrecio(tipo.precio)}</span>
				</span>
				<span class="mt-1 block text-xs text-white/50">
					{tipo.duracionFranjas}h{tipo.descripcion ? ` · ${tipo.descripcion}` : ''}
				</span>
			</button>
		{/each}
	</div>
</fieldset>
