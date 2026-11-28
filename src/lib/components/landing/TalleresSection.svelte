<script lang="ts">
	import { resolve } from '$app/paths';
	import { formatearPrecio } from '$lib/formato';
	import SectionKicker from './SectionKicker.svelte';
	import SectionLogo from './SectionLogo.svelte';

	type Taller = { id: string; nombre: string; precio: number; descripcion: string };
	let { active, talleres }: { active: boolean; talleres: Taller[] } = $props();

	// Se anima la primera vez que la sección entra en pantalla y luego queda visible
	let visto = $state(false);
	$effect(() => {
		if (active) visto = true;
	});

	const beneficios = ['A tu ritmo', 'Acceso cuando lo necesites', 'Videos y ejercicios guiados'];
</script>

<section id="talleres" class="relative min-h-dvh snap-start snap-always overflow-hidden">
	<!-- Fondo solo con CSS (sin WebGL): un brillo cálido que respira detrás del contenido -->
	<div class="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
		<div
			class="halo absolute top-1/2 left-1/2 h-[70vmax] w-[70vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,172,31,0.22),rgba(242,118,43,0.08)_40%,transparent_70%)]"
		></div>
		<div
			class="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background to-transparent"
		></div>
	</div>
	<SectionLogo />

	<div
		class="relative mx-auto flex min-h-dvh max-w-6xl flex-col justify-center gap-10 px-6 pt-36 pb-24 text-white md:px-10 md:pt-40"
	>
		<div class="entrada grid max-w-2xl gap-4" class:visible={visto}>
			<SectionKicker text="Talleres online" {active} />
			<h2 class="font-title text-4xl leading-tight font-bold text-[#cd973a] uppercase sm:text-5xl">
				Sigue avanzando <span class="text-accent">entre sesiones</span>
			</h2>
			<p class="text-lg text-gray-100">
				Talleres en video para trabajar a tu ritmo lo que hablamos en consulta: entender tus
				impulsos, ordenar tus emociones y construir nuevos hábitos.
			</p>
			<ul class="flex flex-wrap gap-2">
				{#each beneficios as b (b)}
					<li class="badge badge-ok px-3 py-1">{b}</li>
				{/each}
			</ul>
		</div>

		{#if talleres.length > 0}
			<div class="grid gap-4 md:grid-cols-3">
				{#each talleres as t, i (t.id)}
					<!-- La animación va en el contenedor para no retrasar el hover de la tarjeta -->
					<div
						class="entrada {i === 2 ? 'hidden md:block' : ''}"
						class:visible={visto}
						style="transition-delay: {visto ? 150 + i * 100 : 0}ms"
					>
						<a
							href={resolve('/aplicacion/talleres/[id]', { id: t.id })}
							class="option-card group flex h-full flex-col gap-2 !p-5 md:!p-6"
						>
							<span
								class="grid h-10 w-10 place-items-center rounded-full bg-accent text-black transition group-hover:scale-110"
								aria-hidden="true">▶</span
							>
							<h3 class="mt-2 text-2xl leading-tight md:text-3xl">{t.nombre}</h3>
							<p class="line-clamp-2 flex-1 text-sm text-white/60">{t.descripcion}</p>
							<span class="mt-2 font-semibold text-accent">{formatearPrecio(t.precio)}</span>
						</a>
					</div>
				{/each}
			</div>
		{:else}
			<p class="entrada panel max-w-xl text-white/70" class:visible={visto}>
				Muy pronto vas a encontrar aquí los primeros talleres. Entra al catálogo para estar atento.
			</p>
		{/if}

		<div class="entrada flex flex-wrap gap-3" class:visible={visto} style="transition-delay: 450ms">
			<a href={resolve('/aplicacion/talleres')} class="btn-primary flex-1 sm:flex-none">
				Ver todos los talleres
			</a>
		</div>
	</div>
</section>

<style>
	/* Solo transform y opacity: se componen en la GPU, sin repintar */
	.entrada {
		opacity: 0;
		transform: translateY(24px);
		transition:
			opacity 0.8s ease-out,
			transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
	}
	.entrada.visible {
		opacity: 1;
		transform: none;
	}

	.halo {
		animation: respirar 8s ease-in-out infinite;
	}
	@keyframes respirar {
		0%,
		100% {
			opacity: 0.7;
			transform: scale(0.9);
		}
		50% {
			opacity: 1;
			transform: scale(1.05);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.entrada {
			opacity: 1;
			transform: none;
			transition: none;
		}
		.halo {
			animation: none;
		}
	}
</style>
