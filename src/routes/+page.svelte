<script lang="ts">
	import Icon from '@iconify/svelte';
	import mymountsinai from '@iconify-icons/arcticons/mymountsinai';
	import CardGallery from '$lib/components/landing/cardGallery.svelte';
	import Banner from '$lib/components/landing/banner.svelte';
	import Footer from '$lib/components/ui/Footer.svelte';
</script>

<main class="overflow-x-hidden">
	<Banner />
	<section class="mt-2 grid gap-4 px-4 py-2 text-center font-cursive text-xl">
		<div class="flex justify-center gap-2">
			<h3 class="font-title text-2xl">Alejandro Piña</h3>
			<Icon icon={mymountsinai} class="h-12 w-12 text-primary" />
		</div>
		<p>
			Creo en el poder de las conversaciones honestas para transformar vidas. He vivido en carne
			propia que siempre hay una salida y por eso hoy acompaño a otros a encontrar la suya.
		</p>

		<h2 class="text-xl">Conversaciones que abren nuevas posibilidades</h2>
		<p>
			"A veces no necesitas mas fuerza de voluntad, necesitas una conversacion que te permita ver lo
			que hoy no estas viendo"
		</p>

		<p class="font-main">
			Acompañamiento de coaching para que te conozcas, te entiendas y tomes decisiones alineadas con
			tu bienestar y tu proposito
		</p>
	</section>
	<section class="text-md p-2">
		<CardGallery />
	</section>

	<Footer />
</main>
