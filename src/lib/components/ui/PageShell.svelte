<script lang="ts">
	import type { Snippet } from 'svelte';
	import SectionLogo from '$lib/components/landing/SectionLogo.svelte';
	import Footer from './Footer.svelte';

	/** Contenedor de las páginas fuera de la landing: mismo fondo, logo y footer que sus secciones. */
	type Props = {
		/** Centra el contenido verticalmente (login, resultados de pago) */
		centrado?: boolean;
		/** Ancho máximo del contenido (clase literal de Tailwind) */
		ancho?: string;
		/** Contenido arriba a la derecha (p.ej. la barra de sesión) */
		acciones?: Snippet;
		children: Snippet;
	};
	let { centrado = false, ancho = 'max-w-3xl', acciones, children }: Props = $props();
</script>

<div
	class="relative flex min-h-dvh flex-col items-center overflow-x-hidden px-4 pt-36 pb-20 text-white md:pt-28
		{centrado ? 'justify-center' : ''}"
>
	<div
		class="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(255,172,31,0.12),transparent_60%)]"
	></div>
	<SectionLogo />
	<div class="w-full {ancho}">
		{#if acciones}
			<!-- En móvil va bajo el logo centrado; en escritorio, arriba a la derecha -->
			<div class="mb-6 flex justify-end md:absolute md:top-6 md:right-6 md:mb-0">
				{@render acciones()}
			</div>
		{/if}
		{@render children()}
	</div>

	<Footer class="absolute bottom-0" />
</div>
