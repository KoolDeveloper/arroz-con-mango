<script lang="ts">
	import Icon from '@iconify/svelte';
	import mymountsinai from '@iconify-icons/arcticons/mymountsinai';
	import CardGallery from '$lib/components/landing/cardGallery.svelte';
	import Footer from '$lib/components/ui/Footer.svelte';
</script>

<div class="bg-linear-to-tl from-[#F58529] via-[#FF0000] to-[#F58529] text-xl">
	<main class="grid h-screen w-screen grid-cols-32 grid-rows-18 overflow-hidden">
		<section
			class="col-span-8 col-start-2 row-span-17"
		>
			<img class="h-full w-full rounded-b-md" src="/banner.jpeg" alt="" />
		</section>
		<section
			class="font-cursive col-span-14 col-start-11 row-span-3 rounded-b-md text-white px-4 py-2"
		>
			<div class="flex items-center gap-2">
				<h3 class="font-title">Alejando Piña</h3>
				<Icon icon={mymountsinai} class="w-12 h-12 text-primary" />
			</div>
			<p>
				Creo en el poder de las conversaciones honestas para transformar vidas. He vivido en carne
				propia que siempre hay una salida y por eso hoy acompaño a otros a encontrar la suya.
			</p>
		</section>
		<section
			class="text-md col-span-21 col-start-11 row-span-12 row-start-5 rounded-md text-white p-2"
		>
			<CardGallery />
		</section>

		<Footer />
	</main>
</div>
