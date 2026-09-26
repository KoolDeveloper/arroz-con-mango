<script lang="ts">
	import Icon from '@iconify/svelte';
	import mymountsinai from '@iconify-icons/arcticons/mymountsinai';
	import CardGallery from '$lib/components/landing/cardGallery.svelte';
	import Banner from '$lib/components/landing/banner.svelte';
	import Footer from '$lib/components/ui/Footer.svelte';
</script>

<main class="overflow-x-hidden">
	<Banner />
	<section class="font-cursive rounded-b-md px-4 py-2">
		<div class="flex items-center gap-2">
			<h3 class="font-title">Alejando Piña</h3>
			<Icon icon={mymountsinai} class="h-12 w-12 text-primary" />
		</div>
		<p>
			Creo en el poder de las conversaciones honestas para transformar vidas. He vivido en carne
			propia que siempre hay una salida y por eso hoy acompaño a otros a encontrar la suya.
		</p>
	</section>
	<section class="text-md rounded-md p-2">
		<CardGallery />
	</section>

	<Footer />
</main>
