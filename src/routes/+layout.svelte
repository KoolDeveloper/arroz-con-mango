<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.ico';
	import { onMount } from 'svelte';
	import { appState } from '$lib/stores/appState.svelte';
	import { gsap } from 'gsap';

	let { children } = $props();
	let loaderElement: HTMLElement;
	let imageLoaded = $state(false);

	onMount(() => {
		const startTime = Date.now();
		const minDisplayTime = 1500; // Tiempo mínimo visible en ms (1.5 segundos)

		const finishLoaderAnimation = () => {
			imageLoaded = true;

			// Calculamos cuánto tiempo ha pasado desde que abrió la web
			const elapsed = Date.now() - startTime;
			// Si cargó muy rápido, esperamos lo que falte para completar los 1.5s
			const remainingTime = Math.max(0, minDisplayTime - elapsed);

			setTimeout(() => {
				if (!loaderElement) return;

				gsap.to(loaderElement, {
					opacity: 0,
					scale: 1.05,
					duration: 0.8,
					ease: 'power2.inOut',
					onComplete: () => {
						appState.finishLoading();
					}
				});
			}, remainingTime);
		};

		const img = new Image();
		img.src = '/modal.jpg';

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
    <title>Alejo Mentor - Liberate</title>
    <meta
        name="description"
        content="Acompañamiento de mentoria para que te conozcas, te entiendas y tomes decisiones alineadas con tu bienestar y tu proposito"
    />
</svelte:head>

{#if appState.isInitialLoading}
    <div
        bind:this={loaderElement}
        class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background text-primary overflow-hidden"
    >
        <!-- CAPA 1: Fondo difuminado o color base mientras carga -->
        <div class="absolute inset-0 bg-background/80 backdrop-blur-md z-0"></div>

        <!-- CAPA 2: La imagen real con transición suave (Blur Loading) -->
        <img 
            src="/modal.jpg" 
            alt="Background Loader" 
            class="absolute inset-0 h-full w-full object-cover object-center transition-all duration-700 ease-out z-0 
                   {imageLoaded ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-xl scale-105'}"
        />

        <!-- CAPA 3: Overlay oscuro opcional para que el texto y spinner resalten sobre la imagen -->
        <div class="absolute inset-0 bg-black/50 z-0"></div>

        <!-- CONTENIDO DEL LOADER (Z-10 para estar por encima de las capas visuales) -->
        <div class="relative z-10 flex flex-col items-center justify-center">
            <div
                class="mb-4 h-16 w-16 animate-spin rounded-full border-4 border-primary/30 border-t-primary"
            ></div>
            <h1 class="font-title text-xl font-bold tracking-widest text-white">Cargando Alejo Mentor...</h1>
        </div>
    </div>
{/if}

<!-- 2. EL CONTENIDO DE LA PÁGINA -->
<div id="page-wrapper" class="min-h-screen">
    <main id="page-content">
        {@render children()}
    </main>
</div>