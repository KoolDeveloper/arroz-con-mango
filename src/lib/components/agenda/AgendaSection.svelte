<script lang="ts">
	import { fly } from 'svelte/transition';
	import Icon from '@iconify/svelte';
	import DownArrow from '@iconify-icons/arcticons/arc-launcher';
	import type { FranjaDB } from '$lib/types/agenda';
	import type { TipoCitaSelect } from '$lib/server/db/schema';
	import { bloquesDisponibles, fechasConDisponibilidad, type Bloque } from '$lib/agenda/slots';
	import { prefersReducedMotion } from '$lib/landing/motion';
	import Prisma from '$lib/components/ui/Prisma.svelte';
	import Footer from '$lib/components/ui/Footer.svelte';
	import Alert from '$lib/components/ui/Alert.svelte';
	import SectionLogo from '$lib/components/landing/SectionLogo.svelte';
	import ServicePicker from './ServicePicker.svelte';
	import DatePicker from './DatePicker.svelte';
	import TimeSlotPicker from './TimeSlotPicker.svelte';
	import BookingSummary from './BookingSummary.svelte';
	import BookingForm from './BookingForm.svelte';

	type Props = {
		tiposCita: TipoCitaSelect[];
		franjas: FranjaDB[];
		paypalHabilitado: boolean;
		error?: string;
	};
	let { tiposCita, franjas, paypalHabilitado, error }: Props = $props();

	// Estado de la selección
	let tipoElegidoId = $state<string | null>(null);
	let fecha = $state('');
	let bloque = $state<Bloque | null>(null);
	let paso = $state<'horario' | 'datos'>('horario');

	const servicio = $derived(tiposCita.find((t) => t.id === tipoElegidoId) ?? tiposCita[0]);
	const fechas = $derived(fechasConDisponibilidad(franjas));
	const bloques = $derived(bloquesDisponibles(franjas, fecha, servicio?.duracionFranjas ?? 1));

	const elegirServicio = (id: string) => {
		tipoElegidoId = id;
		bloque = null;
	};
	const elegirFecha = (f: string) => {
		fecha = f;
		bloque = null;
	};
	const elegirBloque = (b: Bloque) => {
		bloque = b;
		paso = 'datos';
	};

	// Transición entre pasos (sin animación con prefers-reduced-motion)
	const dur = prefersReducedMotion() ? 0 : 250;
	const entrada = { y: -20, duration: dur, delay: dur };
	const salida = { y: 20, duration: dur };
</script>

<section
	id="agenda"
	class="relative flex min-h-dvh snap-start flex-col items-center justify-center px-4 pt-36 pb-20 md:pt-24"
>
	<div class="absolute top-1/2 -z-10 h-1/2 w-full -translate-y-1/2 opacity-30">
		<Prisma height={5} baseWidth={10} scale={1} />
	</div>
	<div
		class="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(255,172,31,0.12),transparent_60%)]"
	></div>
	<SectionLogo />

	<!-- Ambos pasos comparten la misma celda para no apilarse durante la transición -->
	<div class="grid w-full max-w-3xl *:col-start-1 *:row-start-1">
		{#if paso === 'horario' || !bloque || !servicio}
			<div in:fly={entrada} out:fly={salida} class="glass-card w-full text-white">
				<header class="mb-8 text-center">
					<p class="text-xs font-semibold tracking-[0.3em] text-secondary uppercase">
						Reserva online
					</p>
					<h2 class="mt-2 text-4xl text-accent md:text-5xl">Agenda tu sesión</h2>
					<p class="mt-2 text-sm text-white/60">
						Elige el tipo de sesión, el día y la hora que mejor te funcionen.
					</p>
				</header>

				{#if error}<Alert message={error} />{/if}

				{#if tiposCita.length === 0}
					<p class="text-center text-white/60">No hay servicios configurados en este momento.</p>
				{:else if fechas.length === 0}
					<p class="text-center text-white/60">
						No hay disponibilidad de horarios en este momento.
					</p>
				{:else}
					<div class="grid gap-8">
						<ServicePicker tipos={tiposCita} value={servicio.id} onselect={elegirServicio} />
						<DatePicker {fechas} value={fecha} onselect={elegirFecha} />
						{#if fecha}
							<TimeSlotPicker
								{bloques}
								duracion={servicio.duracionFranjas}
								onselect={elegirBloque}
							/>
						{/if}
					</div>
				{/if}
			</div>
		{:else}
			<div in:fly={entrada} out:fly={salida} class="glass-card w-full text-white">
				<button
					type="button"
					onclick={() => (paso = 'horario')}
					class="mb-6 inline-flex items-center gap-2 text-sm text-white/60 transition hover:text-white"
				>
					<Icon icon={DownArrow} class="h-4 w-4 -rotate-90" /> Cambiar horario
				</button>

				{#if error}<Alert message={error} />{/if}

				<BookingSummary {servicio} {fecha} {bloque} />
				<BookingForm {servicio} {bloque} {paypalHabilitado} />
			</div>
		{/if}
	</div>

	<Footer class="absolute bottom-0" />
</section>
