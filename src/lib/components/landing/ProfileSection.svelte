<script lang="ts">
	import SectionBackground from './SectionBackground.svelte';
	import SectionKicker from './SectionKicker.svelte';
	import SectionLogo from './SectionLogo.svelte';

	let { active }: { active: boolean } = $props();
</script>

<section
	id="profile"
	class="relative min-h-screen snap-start snap-always overflow-x-hidden overflow-y-scroll"
>
	<picture>
		<SectionBackground src="profile.webp" alt="Profile" />
		<SectionLogo />
	</picture>

	<div
		class="relative top-[20vh] left-1/2 mb-20 grid max-h-[62vh] w-8/10 max-w-187.5 -translate-x-1/2 gap-4 overflow-y-scroll text-white md:top-0 md:left-0
			   md:ml-10 md:w-auto md:translate-x-0 md:translate-y-[25vh] md:text-left"
	>
		<SectionKicker text="Sobre Mi" {active} />
		<h2 class="text-justify text-4xl text-white uppercase">
			Mirarte de frente y <span class="text-accent">reconocer los patrones</span>.
		</h2>
		<p>
			Durante mucho tiempo podemos estar viviendo en automático, repetir historias, cargar emociones
			y tomar decisiones sin preguntarnos realmente por qué hacemos lo que hacemos. Yo también he
			tenido que cuestionarme, enfrentar mis propias contradicciones y descubrir que cambiar no
			consiste solamente en querer algo diferente.
		</p>
		<p>
			Hoy quiero poner mi experiencia y mis herramientas al servicio de otras personas. Quizás no
			necesitas otra respuesta. <span class="text-accent"
				>Necesitas empezar a hacerte otras preguntas.</span
			> Un espacio de conversación y acompañamiento para explorar lo que estás viviendo, cuestionar aquello
			que das por sentado y descubrir posibilidades que hoy quizás no estás viendo.
		</p>
		<p>
			Comprende tus emociones, cuestiona tus respuestas habituales y recupera tu capacidad de
			elegir. <span class="text-accent">Construir algo diferente</span> Lleva tus reflexiones a la vida
			cotidiana y comienza a crear cambios que tengan sentido para ti.
		</p>
	</div>
</section>
