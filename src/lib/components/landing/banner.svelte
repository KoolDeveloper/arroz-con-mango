<script>
	import AgendaBtn from '$lib/components/ui/AgendaBtn.svelte';
	import { resolve } from '$app/paths';
</script>

<section>
	<div
		class="grid grid-rows-2 bg-black shadow-xl shadow-primary md:h-112.5 md:grid-cols-2 md:grid-rows-1"
	>
		<div class="relative">
			<a href={resolve('/aplicacion/about')} title="Sobre mi" aria-label="Sobre Mi"
				><div class="h-full w-full bg-[url('/banner.jpeg')] bg-cover bg-center"></div></a
			>
			<div
				class="absolute inset-0 bg-linear-to-t from-black via-black/10 to-transparent md:bg-linear-to-l"
			></div>
		</div>

		<div class="flex flex-col items-center justify-center px-6 pb-6 text-white md:p-12">
			<h1 class="mb-4 text-center font-title text-4xl font-bold md:text-5xl">
				LIBÉRATE DE LA DEPENDENCIA Y REDISEÑA TU FUTURO
			</h1>

			<p class="mb-8 text-justify text-xl text-gray-300">
				No puedes construir una vida diferente mirando el mundo desde las mismas creencias que te
				mantienen atrapado. Cuestiona tu mirada, transforma tu realidad.
			</p>
			<quote class="my-6 text-center text-lg font-bold uppercase"
				>"Somos lo que hacemos cuando nadie nos ve".</quote
			>

			<AgendaBtn />
		</div>
	</div>
</section>
