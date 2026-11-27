<script lang="ts">
	import CardGallery from './cardGallery.svelte';
	import SectionBackground from './SectionBackground.svelte';
	import SectionKicker from './SectionKicker.svelte';
	import SectionLogo from './SectionLogo.svelte';

	let { active }: { active: boolean } = $props();
</script>

<section class="relative min-h-screen snap-start snap-always overflow-x-hidden overflow-y-scroll">
	<picture>
		<SectionBackground src="cardsbg.webp" alt="Tarjetas" />
		<SectionLogo />
	</picture>
	<div
		class="relative top-[20vh] left-1/2 mb-20 grid w-8/10 -translate-x-1/2 gap-4 text-white md:top-0 md:left-0
			  md:w-auto md:translate-x-0 md:translate-y-[25vh] md:text-left"
	>
		<SectionKicker text="Podras lograr" {active} style="margin-left: 40px;" />
		<CardGallery />
	</div>
</section>
