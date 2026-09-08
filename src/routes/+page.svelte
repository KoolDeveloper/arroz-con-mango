<script lang="ts">
	import { UserPlus, Sprout, Goal, QrCode } from '@lucide/svelte';
</script>

<div>
	<main class="grid grid-cols-2">
		<section>
			<div>
				<p>
					A veces no necesitas mas fuerza de voluntad, necesitas una conversacion que te permita ver
					lo que hoy no estas viendo
				</p>
			</div>
			<section>
				<div><h2>Conversaciones que abren nuevas posibilidades</h2></div>
				<div>
					<p>
						acompañamiento de coaching para que te conozcas, te entiendas y tomes decisiones
						alineadas con tu bienestar y tu proposito
					</p>
				</div>
				<div>
					<div>
						<UserPlus />
						<div>
							<h3>Claridad</h3>
							<p>Ordena lo que piensas, entiende lo que sientes y decide con claridad</p>
						</div>
					</div>
					<div>
						<Sprout />
						<div>
							<h3>Bienestar Emocional</h3>
							<p>
								Desarrolla herramientas para gestionar el estres, soltar lo que te pesa y recuperar
								tu paz.
							</p>
						</div>
					</div>
					<div>
						<Goal />
						<div>
							<h3>Proposito</h3>
							<p>
								Reconecta con lo que realmente te importa y construye la vida que quieres vivir.
							</p>
						</div>
					</div>
				</div>
				<div>
					<QrCode />
					<div>
						<h3>Hablamos?</h3>
						<p>Escanea el código QR para iniciar una conversación</p>
					</div>
				</div>
			</section>
		</section>
		<section>
			<img class="w-full" src="/banner.png" alt="" />
		</section>
	</main>
	<footer>
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
	</footer>
</div>