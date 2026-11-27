<script lang="ts">
	import MediaIcons from '$lib/components/ui/MediaIcons.svelte';
	import SunriseBackground from '$lib/components/ui/SunriseBackground.svelte';
	import SectionKicker from './SectionKicker.svelte';
	import SectionLogo from './SectionLogo.svelte';

	let { active }: { active: boolean } = $props();
</script>

<section class="relative min-h-screen snap-start snap-always overflow-x-hidden overflow-y-scroll">
	<SunriseBackground variant="aurora" />
	<SectionLogo />
	<div
		class="relative top-[20vh] left-1/2 mb-20 grid w-8/10 max-w-187.5 -translate-x-1/2 gap-4 text-white md:top-0 md:left-0
			   md:ml-10 md:w-auto md:translate-x-0 md:translate-y-[25vh] md:text-left"
	>
		<SectionKicker text="Mis redes - Podcast" {active} />
		<MediaIcons class="mt-10 grid w-full justify-items-center gap-6 md:grid-cols-4" />
	</div>
</section>
