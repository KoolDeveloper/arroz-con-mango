<script lang="ts">
	import { resolve } from '$app/paths';
	import CardGallery from '$lib/components/landing/cardGallery.svelte';
	import Banner from '$lib/components/landing/banner.svelte';
	import Footer from '$lib/components/ui/Footer.svelte';
</script>

<main class="overflow-x-hidden">
	<Banner />
	<section class="mt-20 grid gap-6 px-6 py-2 text-center text-xl">
		<a href={resolve('/aplicacion/about')}>
			<h3 class="font-main text-4xl font-bold text-primary">Alejandro Piña</h3>
		</a>
		<p class="text-justify text-2xl/8 text-black">
			Durante mucho tiempo podemos vivir en automático, repetir historias, cargar emociones y tomar
			decisiones sin preguntarnos realmente por qué hacemos lo que hacemos. Yo también he tenido que
			cuestionarme, enfrentar mis propias contradicciones y descubrir que cambiar no consiste
			solamente en querer algo diferente.
		</p>
		<p class="text-justify text-2xl/8 text-black">
			Hoy quiero poner mi experiencia y mis herramientas al servicio de otras personas. Quizás no
			necesitas otra respuesta. Necesitas empezar a hacerte otras preguntas. Un espacio de
			conversación y acompañamiento para explorar lo que estás viviendo, cuestionar aquello que das
			por sentado y descubrir posibilidades que hoy quizás no estás viendo.
		</p>
		<p class="text-justify text-2xl/8 text-black">
			Mirarte de frente Reconoce los patrones, las creencias y las historias que influyen en tu
			manera de vivir. Hacerte cargo Comprende tus emociones, cuestiona tus respuestas habituales y
			recupera tu capacidad de elegir. Construir algo diferente Lleva tus reflexiones a la vida
			cotidiana y comienza a crear cambios que tengan sentido para ti.
		</p>
	</section>
	<section class="mt-8 p-2 text-2xl">
		<CardGallery />
	</section>

	<section class='mt-8 flex flex-col justify-center items-center gap-4'>
		<h3 class="text-lg font-bold uppercase">Visita mi podcast</h3>
		<a href={resolve('/aplicacion/podcast')} title="Visita mi podcast"><img src="/Arroz.png" alt="Logo Podcast" width='180' height="90"/></a>
	</section>

	<Footer />
</main>
