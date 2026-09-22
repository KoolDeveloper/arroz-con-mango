<script lang="ts">
	import { Sprout } from '@lucide/svelte';
</script>

<div>
	<main class="grid grid-cols-2 border-2 border-primary rounded-md p-6">
		<section class="flex flex-col justify-center items-center gap-4 p-4 rounded-md">
			<section>
				<img class="w-[220px] h-[320px] rounded-md border-2 border-primary" src="/banner.png" alt="" />
			</section>
		</section>
		<section class="bg-surface rounded-md border-2 border-primary p-6">
			<div>Alejando Piña</div>
			<div>
				<h4>Coach en desarrollo personal y bienestar emocional</h4>
				<p>
					Acompaño procesos de transformacion desde la experiencia la empatia y conversaciones que
					generan cambios reales
				</p>
			</div>
			<div>
				<Sprout />
				<p>
					Creo en el poder de las conversaciones honestas para transformar vidas. He vivido en carne
					propia que siempre hay una salida y por eso hoy acompaño a otros a encontrar la suya.
				</p>
			</div>
		</section>
	</main>
	<footer></footer>
</div>
