<script lang="ts">
	import { appState } from '$lib/stores/appState.svelte';
	import { setupLandingAnimations } from '$lib/landing/animations';
	import { SectionNavigator } from '$lib/landing/sectionNavigator.svelte';
	import TransitionCurtain from '$lib/components/ui/TransitionCurtain.svelte';
	import ScrollHint from '$lib/components/ui/ScrollHint.svelte';
	import HeroSection from '$lib/components/landing/HeroSection.svelte';
	import ProfileSection from '$lib/components/landing/ProfileSection.svelte';
	import SocialSection from '$lib/components/landing/SocialSection.svelte';
	import CardsSection from '$lib/components/landing/CardsSection.svelte';
	import AgendaSection from '$lib/components/agenda/AgendaSection.svelte';

	let { data, form } = $props();

	// Orden de las secciones dentro de <main>
	const SECCION = { hero: 0, perfil: 1, redes: 2, tarjetas: 3, agenda: 4 } as const;

	let mainEl: HTMLElement;
	let curtain: TransitionCurtain;
	const nav = new SectionNavigator((dir, onMidpoint) => curtain.play(dir, onMidpoint));

	$effect(() => nav.observe(mainEl));
	$effect(() => {
		if (!appState.isInitialLoading) return setupLandingAnimations(mainEl);
	});
</script>

<svelte:head>
	<link rel="preload" as="image" href="/banner.webp" fetchpriority="high" />
</svelte:head>

<main
	bind:this={mainEl}
	class="h-dvh snap-y snap-mandatory overflow-x-hidden overflow-y-auto overscroll-y-none"
>
	<TransitionCurtain bind:this={curtain} />
	{#if nav.current < SECCION.agenda}<ScrollHint />{/if}

	<HeroSection
		active={nav.current === SECCION.hero}
		onReservar={() => nav.goTo(SECCION.agenda)}
		onHistoria={() => nav.goTo(SECCION.perfil)}
	/>
	<ProfileSection active={nav.current === SECCION.perfil} />
	<SocialSection active={nav.current === SECCION.redes} />
	<CardsSection active={nav.current === SECCION.tarjetas} />
	<AgendaSection
		tiposCita={data.tiposCita}
		franjas={data.franjas}
		paypalHabilitado={data.paypalHabilitado}
		error={form?.error}
	/>
</main>
