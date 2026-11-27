<script lang="ts">
	import { NOMBRE_METODO, type MetodoPago } from '$lib/agenda/payment';
	import StepLabel from './StepLabel.svelte';

	type Props = {
		value: MetodoPago;
		paypalHabilitado: boolean;
		onselect: (metodo: MetodoPago) => void;
	};
	let { value, paypalHabilitado, onselect }: Props = $props();

	const opciones = $derived([
		{
			id: 'mercadopago' as const,
			etiqueta: 'Colombia',
			detalle: 'PSE, Nequi, tarjetas y efectivo · COP',
			habilitado: true
		},
		{
			id: 'paypal' as const,
			etiqueta: 'Internacional',
			detalle: paypalHabilitado
				? 'Tarjeta o cuenta PayPal · se cobra en USD'
				: 'No disponible por el momento',
			habilitado: paypalHabilitado
		}
	]);
</script>

<fieldset>
	<StepLabel>Método de pago</StepLabel>
	<div class="grid gap-3 sm:grid-cols-2">
		{#each opciones as op (op.id)}
			<label
				class="option-card {op.habilitado ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'}
					{value === op.id ? 'option-card-active' : ''}"
			>
				<input
					type="radio"
					name="metodoPago"
					value={op.id}
					class="sr-only"
					disabled={!op.habilitado}
					checked={value === op.id}
					onchange={() => onselect(op.id)}
				/>
				<span class="flex items-center justify-between">
					<span class="font-semibold text-white">{NOMBRE_METODO[op.id]}</span>
					<span
						class="rounded-full bg-white/10 px-2 py-0.5 text-[10px] tracking-wider text-white/70 uppercase"
					>
						{op.etiqueta}
					</span>
				</span>
				<span class="mt-1 block text-xs text-white/50">{op.detalle}</span>
			</label>
		{/each}
	</div>
</fieldset>
