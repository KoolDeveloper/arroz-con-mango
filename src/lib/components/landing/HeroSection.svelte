<script lang="ts">
	import SectionKicker from './SectionKicker.svelte';
	import SectionLogo from './SectionLogo.svelte';
	import SunriseBackground from '$lib/components/ui/SunriseBackground.svelte';

	type Props = {
		active: boolean;
		/** false mientras el loader cubre la página: no animamos nada por debajo. */
		ready?: boolean;
		onReservar: () => void;
		onHistoria: () => void;
		/** Foto opcional que se funde con el amanecer (ej. "/hero.webp"). */
		foto?: string;
	};
	let { active, ready = true, onReservar, onHistoria, foto }: Props = $props();
</script>

<section class="relative min-h-dvh snap-start snap-always">
	<SunriseBackground data-intro="image" rise={false} {foto} paused={!ready} class="opacity-0" />
	<SectionLogo intro />

	<!-- Columna de contenido: el texto y los botones fluyen, nunca se superponen -->
	<div
		class="relative flex min-h-dvh w-full flex-col justify-center gap-8 px-6 pt-36 pb-20 text-white
			   md:max-w-3xl md:pt-40 md:pl-10 lg:pb-24"
	>
		<div class="grid gap-4">
			<SectionKicker text="Mentor  -  Bienestar  -  Propósito" active={active && ready} />
			<h1
				data-intro="title"
				class="font-title text-4xl leading-tight font-bold text-[#cd973a] uppercase opacity-0 sm:text-5xl"
			>
				Vuelve a elegir <span class="animate-pulse text-accent duration-200">tu vida</span>
			</h1>
			<p data-intro="text" class="max-w-xl text-lg text-gray-100 opacity-0 sm:text-xl">
				Acompaño a personas que quieren recuperar su paz, tomar el control, ordenar sus emociones y
				reconstruir su camino hacia una vida más plena, desde mi experiencia con el juego.
			</p>
		</div>

		<div data-intro="buttons" class="flex flex-wrap gap-3 opacity-0">
			<button onclick={onReservar} class="btn-primary flex-1 sm:flex-none">
				Reservar sesión
			</button>
			<button onclick={onHistoria} class="btn-secondary flex-1 sm:flex-none">
				Conoce mi historia
			</button>
		</div>
	</div>
</section>
