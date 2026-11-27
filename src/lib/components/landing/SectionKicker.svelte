<script lang="ts">
	import Shuffle from '$lib/components/ui/Shuffle.svelte';

	let { text, active, style = '' }: { text: string; active: boolean; style?: string } = $props();
</script>

<Shuffle
	{text}
	{active}
	style="font-size: 20px; font-family: var(--font-title); width: 100%; text-align: justify; color: #a1f1c0; {style}"
	duration={0.4}
	loop={true}
	loopDelay={3}
/>
