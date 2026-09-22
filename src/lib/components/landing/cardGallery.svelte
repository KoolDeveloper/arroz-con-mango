<script lang="ts">
	import { UserPlus, Sprout, Goal, QrCode } from '@lucide/svelte';
</script>

<section>
	<div>
		<h2>Conversaciones que abren nuevas posibilidades</h2>
		<p>
			A veces no necesitas mas fuerza de voluntad, necesitas una conversacion que te permita ver lo
			que hoy no estas viendo
		</p>
	</div>
	<div>
		<p>
			acompañamiento de coaching para que te conozcas, te entiendas y tomes decisiones alineadas con
			tu bienestar y tu proposito
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
			<div class="text-4xl">
				<h3 class="font-cursive">Bienestar Emocional</h3>
				<p>
					Desarrolla herramientas para gestionar el estres, soltar lo que te pesa y recuperar tu
					paz.
				</p>
			</div>
		</div>
		<div>
			<Goal />
			<div>
				<h3>Proposito</h3>
				<p>Reconecta con lo que realmente te importa y construye la vida que quieres vivir.</p>
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