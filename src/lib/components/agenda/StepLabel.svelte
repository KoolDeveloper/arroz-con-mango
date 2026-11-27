<script lang="ts">
	import type { Snippet } from 'svelte';

	let { step, children }: { step?: number; children: Snippet } = $props();
</script>

<legend class="step-label">
	{#if step}<span class="step-num">{step}</span>{/if}
	{@render children()}
</legend>
