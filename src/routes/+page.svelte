<script lang="ts">
	import Icon from '@iconify/svelte';
	import mymountsinai from '@iconify-icons/arcticons/mymountsinai';
	import CardGallery from '$lib/components/landing/cardGallery.svelte';
	import Footer from '$lib/components/ui/Footer.svelte';
</script>

<main class="overflow-x-hidden overflow-y-scroll">
	<section class="relative">
		<div class="grid h-112.5 grid-cols-2 overflow-hidden bg-black shadow-2xl">
			<div class="relative">
				<div class="h-full w-full bg-[url('/banner.jpeg')] bg-cover bg-center"></div>
				<div class="absolute inset-0 bg-linear-to-l from-black via-black/10 to-transparent"></div>
			</div>

			<div class="flex flex-col justify-center p-12 text-white">
				<h1 class="mb-4 text-5xl font-bold">LIBÉRATE DE LA DEPENDENCIA Y REDISEÑA TU FUTURO</h1>

				<p class="mb-8 text-lg text-gray-300">
					No cambiamos cuando vemos las cosas diferentes, sino cuando nos damos cuenta de que el
					observador que somos ya no puede sostener la realidad que nos tratamos de inculcar.
				</p>

				<button class="w-fit rounded-lg bg-[#F58529] px-6 py-3 font-semibold hover:bg-[F58529]/90">
					Agenda tu cita
				</button>
			</div>
		</div>
	</section>
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
