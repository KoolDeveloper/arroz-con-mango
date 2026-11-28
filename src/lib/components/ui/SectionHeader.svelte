<script lang="ts">
	/** Encabezado de sección de la landing: kicker verde, título en acento y bajada. */
	type Props = {
		kicker?: string;
		titulo: string;
		subtitulo?: string;
		nivel?: 'h1' | 'h2';
		alinear?: 'center' | 'left';
	};
	let { kicker, titulo, subtitulo, nivel = 'h1', alinear = 'center' }: Props = $props();
</script>

<header class={alinear === 'center' ? 'text-center' : ''}>
	{#if kicker}<p class="kicker">{kicker}</p>{/if}
	<svelte:element this={nivel} class="mt-2 text-4xl text-accent md:text-5xl"
		>{titulo}</svelte:element
	>
	{#if subtitulo}<p class="mt-2 text-sm text-white/60">{subtitulo}</p>{/if}
</header>
