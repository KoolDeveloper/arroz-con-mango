<script>
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import Header from '$lib/components/ui/Header.svelte';
</script>

<main class=" h-screen w-screen">
	<Header />
	<section class="mt-10 flex flex-col items-center justify-center gap-4 p-4">
		<h1 class="text-2xl font-bold">Error {page.status}</h1>
		<p class="text-lg">Ha ocurrido un error inesperado.</p>
		<p class="text-lg">{page.error?.message}</p>
		<a href={resolve('/')} class="text-primary hover:text-secondary">Volver a la página principal</a
		>
	</section>
</main>