<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.ico';
	import { onMount } from 'svelte';
	import { appState } from '$lib/stores/appState.svelte';
	import { gsap } from 'gsap';
	import { prefersReducedMotion } from '$lib/landing/motion';
	import SunriseBackground from '$lib/components/ui/SunriseBackground.svelte';

	let { children } = $props();
	let loaderElement = $state<HTMLElement>();

	onMount(() => {
		// Suficiente para ver salir el sol sin hacer esperar de más
		const minDisplayTime = prefersReducedMotion() ? 300 : 1400;

		const timer = setTimeout(() => {
			if (!loaderElement || prefersReducedMotion()) {
				appState.finishLoading();
				return;
			}
			gsap.to(loaderElement, {
				opacity: 0,
				duration: 0.6,
				ease: 'power2.inOut',
				onComplete: () => appState.finishLoading()
			});
		}, minDisplayTime);

		return () => clearTimeout(timer);
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Alejo Mentor · Sal del juego, vuelve a elegir tu vida</title>
	<meta
		name="description"
		content="Mentoría y acompañamiento para salir de la ludopatía: recupera el control, ordena tus emociones y vuelve a elegir tu vida."
	/>
</svelte:head>

{#if appState.isInitialLoading}
	<div
		bind:this={loaderElement}
		class="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-background"
	>
		<SunriseBackground />

		<div class="relative z-10 flex flex-col items-center gap-4 text-center">
			<img src="/logotipo.png" alt="" class="h-40 w-40 animate-pulse object-cover" />
			<p class="font-title text-xl tracking-widest text-white/90">Un nuevo comienzo…</p>
		</div>
	</div>
{/if}

<div id="page-wrapper" class="min-h-screen">
	<main id="page-content">
		{@render children()}
	</main>
</div>
