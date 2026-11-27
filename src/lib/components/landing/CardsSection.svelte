<script lang="ts">
	import CardGallery from './cardGallery.svelte';
	import SectionBackground from './SectionBackground.svelte';
	import SectionKicker from './SectionKicker.svelte';
	import SectionLogo from './SectionLogo.svelte';

	let { active }: { active: boolean } = $props();
</script>

<section class="relative min-h-dvh snap-start snap-always overflow-hidden">
	<!-- El sol de la foto queda centrado en móvil -->
	<SectionBackground src="cardsbg.webp" alt="" position="object-center" />
	<SectionLogo />

	<div
		class="relative flex min-h-dvh flex-col justify-center gap-6 pt-36 pb-20 text-white md:pt-40"
	>
		<div class="px-6 md:px-10">
			<SectionKicker text="Podrás lograr" {active} />
		</div>
		<CardGallery />
	</div>
</section>
