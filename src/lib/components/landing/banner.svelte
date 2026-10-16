<script>
	import AgendaBtn from '$lib/components/ui/AgendaBtn.svelte';
	//href="https://wa.me/573028023341"
</script>

<section>
	<div
		class="grid grid-rows-2 bg-black shadow-2xl shadow-primary md:h-112.5 md:grid-cols-2 md:grid-rows-1"
	>
		<div class="relative">
			<div class="h-full w-full bg-[url('/banner.jpeg')] bg-cover bg-center"></div>
			<div
				class="absolute inset-0 bg-linear-to-t from-black via-black/10 to-transparent md:bg-linear-to-l"
			></div>
		</div>

		<div class="flex flex-col items-center justify-center px-6 pb-6 text-white md:p-12">
			<h1 class="mb-4 text-center font-title text-4xl font-bold md:text-5xl">
				LIBÉRATE DE LA DEPENDENCIA Y REDISEÑA TU FUTURO
			</h1>

			<p class="mb-8 text-xl text-gray-300">
				No cambiamos cuando vemos las cosas diferentes, sino cuando nos damos cuenta de que el
				observador que somos ya no puede sostener la realidad que nos forzamos a vivir.
			</p>

			<AgendaBtn />
		</div>
	</div>
</section>
