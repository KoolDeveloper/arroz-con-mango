<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.ico';
	import { page } from '$app/state';

	let { children } = $props();

	const siteUrl = 'https://alejopina.com';
	const canonicalUrl = $derived(`${siteUrl}${page.url.pathname}`);
	const title = 'Alejo Coach - Libérate | Coaching de Bienestar y Propósito';
	const description =
		'Acompañamiento de coaching personalizado para que te conozcas, te entiendas y tomes decisiones alineadas con tu bienestar y tu propósito. Agenda tu sesión online.';
	const ogImage = `${siteUrl}/og-image.jpg`;

	const jsonLdScript = `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'ProfessionalService',
		name: 'Alejo Coach - Libérate',
		description: description,
		url: siteUrl,
		image: ogImage,
		priceRange: '$$',
		areaServed: 'Latin America'
	})}${'<'}/script>`;
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="canonical" href={canonicalUrl} />

	<!-- SEO Básico -->
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta name="author" content="Alejo Coach" />
	<meta
		name="keywords"
		content="coaching personal, bienestar, propósito de vida, sesiones de coaching, desarrollo personal, mentoría 1 a 1, Alejo Coach"
	/>

	<!-- Control de indexación: No indexar el dashboard ni las pantallas de retorno de pago -->
	{#if page.url.pathname.startsWith('/dashboard') || page.url.pathname.includes('/agenda/success') || page.url.pathname.includes('/agenda/failure') || page.url.pathname.includes('/agenda/pending')}
		<meta name="robots" content="noindex, nofollow" />
	{:else}
		<meta name="robots" content="index, follow" />
	{/if}

	<!-- Open Graph / WhatsApp / Facebook / Instagram -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={ogImage} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:locale" content="es_CO" />
	<meta property="og:site_name" content="Alejo Coach" />

	<!-- Twitter / X Cards -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={ogImage} />

	<!-- Datos Estructurados (Schema.org) para Google -->
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html jsonLdScript}
</svelte:head>

{@render children()}
