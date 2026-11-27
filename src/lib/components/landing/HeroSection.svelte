<script lang="ts">
	import SectionKicker from './SectionKicker.svelte';
	import SectionLogo from './SectionLogo.svelte';

	type Props = { active: boolean; onReservar: () => void; onHistoria: () => void };
	let { active, onReservar, onHistoria }: Props = $props();
</script>

<section class="relative h-screen snap-start snap-always">
	<picture>
		<SectionLogo intro />
		<img
			data-intro="image"
			src="banner.webp"
			alt="Banner"
			fetchpriority="high"
			class="h-full w-full object-cover opacity-0"
		/>
	</picture>
	<div
		class="absolute top-0 left-1/2 grid w-8/10 max-w-187.5 -translate-x-1/2 translate-y-[18vh] gap-4 text-white md:left-0 md:ml-10
			   md:w-auto md:translate-x-0 md:translate-y-[25vh] md:text-left"
	>
		<SectionKicker text="Mentor  -  Bienestar  -  Propósito" {active} />
		<h1 data-intro="title" class="text-justify font-title text-5xl font-bold uppercase opacity-0">
			Vuelve a elegir <span class="animate-pulse text-accent duration-200">tu vida</span>
		</h1>
		<p data-intro="text" class="text-justify text-xl font-bold text-gray-300 opacity-0">
			Acompaño a personas a recuperar su paz, ordernar sus emociones y reconstruir su camino hacia
			una vida más plena desde la experiencia.
		</p>
	</div>
	<div
		data-intro="buttons"
		class="absolute bottom-[10vh] left-1/2 grid w-8/10 -translate-x-1/2 items-center justify-center gap-4 text-white opacity-0 md:bottom-[18vh] md:left-0 md:ml-10 md:flex md:w-auto md:translate-x-0"
	>
		<button
			onclick={onReservar}
			class="rounded-full bg-accent px-7 py-3 text-center text-sm font-semibold tracking-wider text-black uppercase shadow-[0_10px_40px_-10px_rgba(255,172,31,0.7)] transition duration-300 hover:-translate-y-0.5 hover:bg-white"
		>
			Reservar sesión
		</button>
		<button
			onclick={onHistoria}
			class="rounded-full border border-white/30 bg-white/5 px-7 py-3 text-center text-sm font-semibold tracking-wider text-white uppercase backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:border-accent hover:text-accent"
		>
			Conoce mi historia
		</button>
	</div>
</section>
