<script lang="ts">
	import { resolve } from '$app/paths';
	import PageShell from '$lib/components/ui/PageShell.svelte';
	import SectionHeader from '$lib/components/ui/SectionHeader.svelte';
	import SesionBar from '$lib/components/talleres/SesionBar.svelte';
	import { formatearPrecio } from '$lib/formato';

	let { data } = $props();
</script>

<svelte:head><title>Talleres · Alejo Mentor</title></svelte:head>

<PageShell ancho="max-w-5xl">
	{#snippet acciones()}
		<SesionBar usuario={data.usuario} redirectTo="/aplicacion/talleres" />
	{/snippet}

	<SectionHeader
		kicker="Aprende a tu ritmo"
		titulo="Talleres"
		subtitulo="Compra un taller una vez y tendrás acceso cuando lo necesites."
	/>

	<div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
		{#each data.talleres as t (t.id)}
			<a
				href={resolve('/aplicacion/talleres/[id]', { id: t.id })}
				class="option-card flex flex-col gap-3 !p-6"
			>
				<h2 class="text-3xl leading-tight text-white">{t.nombre}</h2>
				<p class="line-clamp-4 flex-1 text-sm whitespace-pre-line text-white/60">{t.descripcion}</p>
				{#if t.comprado}
					<span class="badge badge-ok w-fit">Ya es tuyo · Ver contenido</span>
				{:else}
					<span class="font-semibold text-accent">{formatearPrecio(t.precio)}</span>
				{/if}
			</a>
		{:else}
			<p class="text-center text-white/50 sm:col-span-2 lg:col-span-3">
				Pronto habrá talleres disponibles.
			</p>
		{/each}
	</div>
</PageShell>
