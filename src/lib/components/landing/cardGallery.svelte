<script lang="ts">
	import Icon from '@iconify/svelte';
	import ok from '@iconify-icons/arcticons/ok';
	import clear from '@iconify-icons/arcticons/clear';
	import goodwyGallery from '@iconify-icons/arcticons/goodwy-gallery';
	import { inViewport } from '$lib/actions/inViewport';

	// c1 = color principal del icono, c2 = color del borde (los colores originales de cada tarjeta)
	const skills = [
		{
			title: 'Claridad',
			description: 'Ordena lo que piensas, entiende lo que sientes y decide con claridad.',
			icon: clear,
			c1: '#38BDF8',
			c2: '#0284C7'
		},
		{
			title: 'Bienestar Emocional',
			description:
				'Desarrolla herramientas para gestionar el estrés, soltar lo que te pesa y recuperar tu paz.',
			icon: ok,
			c1: '#10B981',
			c2: '#5ef97b'
		},
		{
			title: 'Propósito',
			description:
				'Reconecta con lo que realmente te importa y construye la vida que quieres vivir.',
			icon: goodwyGallery,
			c1: '#f30313',
			c2: '#a10684'
		}
	];

	let scroller: HTMLDivElement;
	let cards: HTMLElement[] = [];
	let actual = $state(0);

	// Carrusel en móvil: detecta qué tarjeta está centrada para los indicadores
	$effect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				for (const e of entries) {
					if (e.isIntersecting) actual = cards.indexOf(e.target as HTMLElement);
				}
			},
			{ root: scroller, threshold: 0.6 }
		);
		cards.forEach((c) => observer.observe(c));
		return () => observer.disconnect();
	});

	const irA = (i: number) =>
		cards[i]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });

	// Luz que sigue al puntero dentro de la tarjeta
	const seguirPuntero = (e: PointerEvent) => {
		const el = e.currentTarget as HTMLElement;
		const r = el.getBoundingClientRect();
		el.style.setProperty('--mx', `${e.clientX - r.left}px`);
		el.style.setProperty('--my', `${e.clientY - r.top}px`);
	};
</script>

<!-- data-inview (inViewport) dispara la entrada y pausa las animaciones fuera de pantalla -->
<div
	bind:this={scroller}
	use:inViewport
	class="gallery flex snap-x snap-mandatory scroll-px-6 [scrollbar-width:none] gap-4 overflow-x-auto px-6 pt-2 pb-6
		   md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-10 [&::-webkit-scrollbar]:hidden"
>
	{#each skills as skill, i (skill.title)}
		<article
			bind:this={cards[i]}
			onpointermove={seguirPuntero}
			class="skill-card w-[78vw] max-w-sm shrink-0 snap-center md:w-auto md:max-w-none"
			style="--c1: {skill.c1}; --c2: {skill.c2}; --delay: {i * 120}ms"
		>
			<div class="spotlight"></div>

			<div class="relative flex items-start justify-between">
				<div class="icon-badge">
					<!-- Giro lento solo en la 1ª y 3ª tarjeta -->
					<Icon
						icon={skill.icon}
						class="h-9 w-9 {i !== 1
							? 'animate-spin [animation-duration:8s] motion-reduce:animate-none'
							: ''}"
					/>
				</div>
				<span class="font-title text-4xl text-white/15">0{i + 1}</span>
			</div>

			<h3 class="relative mt-6 text-3xl text-white">{skill.title}</h3>
			<p class="relative mt-2 text-sm leading-relaxed text-white/70">{skill.description}</p>

			<div class="bar"></div>
		</article>
	{/each}
</div>

<!-- Indicadores del carrusel (solo móvil) -->
<div class="flex justify-center gap-2 md:hidden">
	{#each skills as skill, i (skill.title)}
		<button
			type="button"
			aria-label="Ver {skill.title}"
			aria-current={actual === i}
			onclick={() => irA(i)}
			class="h-1.5 rounded-full transition-all duration-300 {actual === i
				? 'w-6'
				: 'w-1.5 bg-white/30'}"
			style={actual === i ? `background: ${skill.c1}` : ''}
		></button>
	{/each}
</div>

<style>
	/*
	 * Rendimiento: todo lo que se anima es transform/opacity (compositor de la GPU).
	 * Sin backdrop-filter ni @property animado, que obligan a repintar cada cuadro.
	 */
	.skill-card {
		position: relative;
		isolation: isolate;
		overflow: hidden;
		border-radius: 1.75rem;
		padding: 1.5rem;
		min-height: 17rem;
		box-shadow: 0 20px 50px -25px rgb(0 0 0 / 0.8);
		opacity: 0;
		translate: 0 30px;
		transition:
			transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
			box-shadow 0.35s,
			opacity 0.7s ease var(--delay),
			translate 0.7s cubic-bezier(0.22, 1, 0.36, 1) var(--delay);
	}
	.gallery:global([data-inview]) .skill-card {
		opacity: 1;
		translate: 0 0;
	}

	/* Borde degradado giratorio: una capa cónica grande que rota con transform... */
	.skill-card::before {
		content: '';
		position: absolute;
		inset: -50%;
		z-index: -2;
		background: conic-gradient(var(--c1), var(--c2), transparent 35%, transparent 65%, var(--c1));
		animation: border-spin 7s linear infinite;
	}
	/* ...tapada por el fondo de la tarjeta, dejando visible solo un borde de 1.5px */
	.skill-card::after {
		content: '';
		position: absolute;
		inset: 1.5px;
		z-index: -1;
		border-radius: calc(1.75rem - 1.5px);
		background:
			linear-gradient(160deg, color-mix(in srgb, var(--c1) 16%, transparent), transparent 55%),
			#101014;
	}

	.skill-card:hover {
		transform: translateY(-6px);
		box-shadow: 0 30px 60px -20px color-mix(in srgb, var(--c1) 45%, transparent);
	}

	.spotlight {
		position: absolute;
		inset: 0;
		opacity: 0;
		background: radial-gradient(
			260px circle at var(--mx, 50%) var(--my, 0%),
			color-mix(in srgb, var(--c1) 28%, transparent),
			transparent 70%
		);
		transition: opacity 0.3s;
	}
	.skill-card:hover .spotlight {
		opacity: 1;
	}

	.icon-badge {
		display: grid;
		place-items: center;
		width: 3.75rem;
		height: 3.75rem;
		border-radius: 1.1rem;
		color: var(--c1);
		background: color-mix(in srgb, var(--c1) 14%, transparent);
		border: 1px solid color-mix(in srgb, var(--c1) 35%, transparent);
		box-shadow: 0 0 30px -6px color-mix(in srgb, var(--c1) 60%, transparent);
	}

	/* Línea inferior que se llena al aparecer */
	.bar {
		position: absolute;
		left: 1.5rem;
		right: 1.5rem;
		bottom: 1.25rem;
		height: 2px;
		border-radius: 9999px;
		background: linear-gradient(to right, var(--c1), var(--c2));
		transform: scaleX(0);
		transform-origin: left;
		transition: transform 1s cubic-bezier(0.22, 1, 0.36, 1) calc(var(--delay) + 300ms);
	}
	.gallery:global([data-inview]) .bar {
		transform: scaleX(0.35);
	}
	.skill-card:hover .bar {
		transform: scaleX(1);
		transition-delay: 0s;
	}

	/* Fuera del viewport: borde e iconos en pausa */
	.gallery:not([data-inview]) .skill-card::before,
	.gallery:not([data-inview]) :global(svg) {
		animation-play-state: paused;
	}

	@keyframes border-spin {
		to {
			transform: rotate(1turn);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.skill-card,
		.skill-card::before,
		.bar {
			animation: none;
			transition: none;
		}
		.skill-card {
			opacity: 1;
			translate: 0 0;
		}
		.skill-card:hover {
			transform: none;
		}
	}
</style>
