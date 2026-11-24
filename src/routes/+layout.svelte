<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.ico';
	import { onMount } from 'svelte';
	import { appState } from '$lib/stores/appState.svelte';
	import { gsap } from 'gsap';
	import loadIcon from '@iconify-icons/arcticons/apple-photos';
	import Icon from '@iconify/svelte';

	let { children } = $props();
	let loaderElement: HTMLElement;
	let imageLoaded = $state(false);

	onMount(() => {
		const startTime = Date.now();
		// Short enough to feel instant, long enough to avoid a flash of unstyled content.
		const minDisplayTime = 600;
		const reduceMotion =
			typeof window !== 'undefined' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		const finishLoaderAnimation = () => {
			imageLoaded = true;

			// Calculamos cuánto tiempo ha pasado desde que abrió la web
			const elapsed = Date.now() - startTime;
			// Si cargó muy rápido, esperamos lo que falte para completar el mínimo
			const remainingTime = Math.max(0, minDisplayTime - elapsed);

			setTimeout(() => {
				if (!loaderElement) return;

				if (reduceMotion) {
					appState.finishLoading();
					return;
				}

				gsap.to(loaderElement, {
					opacity: 0,
					scale: 1.05,
					duration: 0.45,
					ease: 'power2.inOut',
					onComplete: () => {
						appState.finishLoading();
					}
				});
			}, remainingTime);
		};

		const img = new Image();
		img.src = '/modal.webp';

		// Si ya está en caché del navegador, disparamos de una vez
		if (img.complete) {
			finishLoaderAnimation();
		} else {
			img.onload = finishLoaderAnimation;
			// Fallback por si la imagen falla al cargar, para no bloquear la web
			img.onerror = finishLoaderAnimation;
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="preload" as="image" href="/modal.webp" />
	<title>Alejo Mentor - Liberate</title>
	<meta
		name="description"
		content="Acompañamiento de mentoria para que te conozcas, te entiendas y tomes decisiones alineadas con tu bienestar y tu proposito"
	/>
</svelte:head>

{#if appState.isInitialLoading}
	<div
		bind:this={loaderElement}
		class="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-background text-primary"
	>
		<!-- CAPA 1: Fondo difuminado o color base mientras carga -->
		<div class="absolute inset-0 z-0 bg-background/80 backdrop-blur-md"></div>

		<!-- CAPA 2: La imagen real con transición suave (Blur Loading) -->
		<img
			src="/modal.webp" 
			alt="Background Loader"
			class="absolute inset-0 z-0 h-full w-full object-cover object-center transition-all duration-700 ease-out
                   {imageLoaded ? 'blur-0 scale-100 opacity-100' : 'scale-105 opacity-0 blur-xl'}"
		/>

		<!-- CAPA 3: Overlay oscuro opcional para que el texto y spinner resalten sobre la imagen -->
		<div class="absolute inset-0 z-0 bg-black/50"></div>

		<!-- CONTENIDO DEL LOADER (Z-10 para estar por encima de las capas visuales) -->
		<div class="relative z-10 flex flex-col items-center justify-center">
			<!--
			<div
			class="mb-4 h-16 w-16 animate-spin rounded-full border-4 border-primary/30 border-t-primary"
            ></div>
			-->
			<Icon icon={loadIcon} class="mb-4 h-20 w-20 animate-spin text-primary" />
			<h1 class="font-title text-xl font-bold tracking-widest text-white">
				Preparando tu experiencia...
			</h1>
		</div>
	</div>
{/if}

<!-- 2. EL CONTENIDO DE LA PÁGINA -->
<div id="page-wrapper" class="min-h-screen">
	<main id="page-content">
		{@render children()}
	</main>
</div>
