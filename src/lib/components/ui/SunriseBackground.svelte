<!--
	Fondo generativo de la marca. Sin imágenes externas; respeta prefers-reduced-motion.
	- variant="amanecer": cielo nocturno que se calienta, un sol que asoma sobre el
	  horizonte y su reflejo en el agua. Metáfora de volver a empezar.
	- variant="aurora": versión serena, sin sol: luces suaves verdes y ámbar.
	- foto: imagen opcional que se funde con el fondo (se desvanece hacia el texto).
	Rendimiento: solo se animan transform/opacity (compositor, sin repintar), sin
	filter/blur ni mix-blend, y todo se pausa fuera del viewport.
-->
<script lang="ts">
	import { inViewport } from '$lib/actions/inViewport';

	type Props = {
		variant?: 'amanecer' | 'aurora';
		/** Anima la salida del sol al montar (solo en "amanecer"). */
		rise?: boolean;
		foto?: string;
		/** Fuerza la pausa (ej. mientras otra capa lo tapa). */
		paused?: boolean;
		class?: string;
		[key: `data-${string}`]: unknown;
	};
	let {
		variant = 'amanecer',
		rise = true,
		foto,
		paused = false,
		class: className = '',
		...rest
	}: Props = $props();
</script>

<div
	{...rest}
	use:inViewport
	aria-hidden="true"
	class="sunrise pointer-events-none absolute inset-0 overflow-hidden {className}"
	class:rise={rise && variant === 'amanecer'}
	class:aurora={variant === 'aurora'}
	class:paused
>
	<!-- Cielo -->
	<div class="sky">
		<div class="orb orb-green"></div>
		<div class="orb orb-amber"></div>
		{#if variant === 'amanecer'}
			<div class="sun-glow"></div>
			<div class="sun"></div>
		{/if}
	</div>

	{#if variant === 'amanecer'}
		<!-- Horizonte -->
		<div class="horizon"></div>

		<!-- Agua y reflejo -->
		<div class="water">
			<div class="reflection"></div>
		</div>
	{/if}

	{#if foto}
		<img src={foto} alt="" class="photo" fetchpriority="high" />
	{/if}

	<!-- Grano y viñeta -->
	<div class="grain"></div>
	<div class="vignette"></div>
</div>

<style>
	/* ── Foto opcional: se tiñe con el amanecer y se desvanece hacia el texto ── */
	.photo {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: 70% 30%;
		opacity: 0.55;
		mix-blend-mode: luminosity;
		mask-image: linear-gradient(to bottom, #000 30%, transparent 95%);
		-webkit-mask-image: linear-gradient(to bottom, #000 30%, transparent 95%);
	}
	@media (min-width: 768px) {
		.photo {
			mask-image: linear-gradient(to right, transparent 25%, #000 65%);
			-webkit-mask-image: linear-gradient(to right, transparent 25%, #000 65%);
		}
	}

	/* ── Variante aurora: sin sol, cielo completo y luces más presentes ── */
	.aurora .sky {
		inset: 0;
		background:
			radial-gradient(ellipse 80% 60% at 20% 100%, rgb(132 183 69 / 0.18), transparent 70%),
			radial-gradient(ellipse 70% 50% at 85% 90%, rgb(255 172 31 / 0.16), transparent 70%),
			linear-gradient(to bottom, #07070c 0%, #0f1013 60%, var(--color-background) 100%);
	}
	.aurora .orb-green {
		opacity: 0.28;
	}
	.aurora .orb-amber {
		opacity: 0.22;
		top: auto;
		bottom: -25vw;
	}

	.sunrise {
		--horizon: 64%;
		--sun-x: 50%;
		--sun-size: min(70vw, 440px);
		background: var(--color-background);
	}
	@media (min-width: 768px) {
		.sunrise {
			--horizon: 70%;
			--sun-x: 72%;
			--sun-size: min(38vw, 560px);
		}
	}

	.sky {
		position: absolute;
		inset: 0 0 calc(100% - var(--horizon)) 0;
		overflow: hidden;
		background:
			radial-gradient(
				ellipse 90% 70% at var(--sun-x) 100%,
				rgb(242 118 43 / 0.45),
				rgb(242 118 43 / 0.12) 45%,
				transparent 75%
			),
			linear-gradient(to bottom, #07070c 0%, #120f17 45%, #2b1710 100%);
	}

	.sun,
	.sun-glow {
		position: absolute;
		left: var(--sun-x);
		bottom: 0;
		border-radius: 9999px;
		transform: translate(-50%, 55%);
	}
	.sun {
		width: var(--sun-size);
		aspect-ratio: 1;
		background: radial-gradient(
			circle at 50% 45%,
			#fff4d6 0%,
			#ffd27a 22%,
			var(--color-accent) 45%,
			var(--color-primary) 70%,
			rgb(242 118 43 / 0) 72%
		);
	}
	.sun-glow {
		width: calc(var(--sun-size) * 2.2);
		aspect-ratio: 1;
		background: radial-gradient(circle, rgb(255 172 31 / 0.35), transparent 60%);
		animation: breathe 9s ease-in-out infinite;
	}

	/* Degradado radial en vez de filter: blur(), que es carísimo en móvil */
	.orb {
		position: absolute;
		border-radius: 9999px;
		opacity: 0.35;
	}
	.orb-green {
		width: 75vw;
		height: 75vw;
		top: -30vw;
		left: -25vw;
		background: radial-gradient(circle, var(--color-secondary), transparent 65%);
		opacity: 0.18;
		animation: drift 28s ease-in-out infinite alternate;
	}
	.orb-amber {
		width: 60vw;
		height: 60vw;
		top: -5%;
		right: -20vw;
		background: radial-gradient(circle, var(--color-primary), transparent 65%);
		opacity: 0.2;
		animation: drift 34s ease-in-out infinite alternate-reverse;
	}

	.horizon {
		position: absolute;
		left: 0;
		right: 0;
		top: var(--horizon);
		height: 1px;
		background: linear-gradient(
			to right,
			transparent,
			rgb(255 210 122 / 0.5) calc(var(--sun-x) - 25%),
			#fff4d6 var(--sun-x),
			rgb(255 210 122 / 0.5) calc(var(--sun-x) + 25%),
			transparent
		);
		box-shadow: 0 0 24px 2px rgb(255 172 31 / 0.45);
	}

	.water {
		position: absolute;
		inset: var(--horizon) 0 0 0;
		background: linear-gradient(to bottom, #1b100c 0%, #0d0b0e 60%, var(--color-background) 100%);
	}
	.reflection {
		position: absolute;
		inset: 0;
		background: radial-gradient(
			ellipse calc(var(--sun-size) * 0.5) 90% at var(--sun-x) 0%,
			rgb(255 190 90 / 0.55),
			rgb(242 118 43 / 0.15) 50%,
			transparent 80%
		);
		/* Líneas horizontales que simulan el oleaje */
		mask-image: repeating-linear-gradient(to bottom, #000 0 2px, transparent 2px 7px);
		-webkit-mask-image: repeating-linear-gradient(to bottom, #000 0 2px, transparent 2px 7px);
		animation: shimmer 6s ease-in-out infinite;
	}

	.grain {
		position: absolute;
		inset: 0;
		/* Sin mix-blend-mode: obligaba a recomponer toda la pantalla en cada cuadro */
		opacity: 0.04;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
	}
	.vignette {
		position: absolute;
		inset: 0;
		background:
			radial-gradient(ellipse at center, transparent 50%, rgb(0 0 0 / 0.55) 100%),
			linear-gradient(to right, rgb(0 0 0 / 0.45), transparent 55%);
	}

	/* Salida del sol */
	.rise .sun,
	.rise .sun-glow {
		animation-name: rise, breathe;
		animation-duration: 3.2s, 9s;
		animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1), ease-in-out;
		animation-iteration-count: 1, infinite;
		animation-delay: 0s, 3.2s;
		animation-fill-mode: both, none;
	}
	.rise .sun {
		animation-name: rise;
		animation-duration: 3.2s;
		animation-iteration-count: 1;
	}

	@keyframes rise {
		from {
			transform: translate(-50%, 95%);
		}
		to {
			transform: translate(-50%, 55%);
		}
	}
	@keyframes breathe {
		0%,
		100% {
			opacity: 0.85;
		}
		50% {
			opacity: 1;
		}
	}
	@keyframes drift {
		to {
			transform: translate(6vw, 4vw) scale(1.1);
		}
	}
	@keyframes shimmer {
		0%,
		100% {
			opacity: 0.75;
			transform: scaleX(1);
		}
		50% {
			opacity: 1;
			transform: scaleX(1.06);
		}
	}

	/* Fuera del viewport no se anima nada (ver $lib/actions/inViewport) */
	.sunrise:not([data-inview]) *,
	.sunrise.paused * {
		animation-play-state: paused !important;
	}

	@media (prefers-reduced-motion: reduce) {
		.sunrise *,
		.rise .sun,
		.rise .sun-glow {
			animation: none !important;
		}
	}
</style>
