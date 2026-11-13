<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.ico';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Alejo Mentor - Liberate</title>
	<meta
		name="description"
		content="Acompañamiento de mentoria para que te conozcas, te entiendas y tomes decisiones alineadas con tu bienestar y tu proposito"
	/>
</svelte:head>

{@render children()}
