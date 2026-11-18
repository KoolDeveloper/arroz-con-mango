<script lang="ts">
	import gsap from 'gsap';
	import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
	import Shuffle from '$lib/components/ui/Shuffle.svelte';
	import { appState } from '$lib/stores/appState.svelte';
	import Prisma from '$lib/components/ui/Prisma.svelte';
	import Footer from '$lib/components/ui/Footer.svelte';
	import MediaIcons from '$lib/components/ui/MediaIcons.svelte';
	import Icon from '@iconify/svelte';
	import DownArrow from '@iconify-icons/arcticons/arc-launcher';
	import Cross from '@iconify-icons/arcticons/cross';
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	let tipoCitaId = $state<string>('');
	let fechaSeleccionada = $state<string>('');
	let bloqueSeleccionado = $state<{
		ids: string[];
		startTime: string;
		endTime: string;
	} | null>(null);
	let enviando = $state<boolean>(false);

	gsap.registerPlugin(ScrollTrigger);
	let mainEl: HTMLElement;
	let transitionOverlay: HTMLElement;
	let form1El: HTMLDivElement;
	let form2El: HTMLDivElement;
	let currentForm = $state(1);

	let currentSectionIndex = $state(0);
	let isTransitioning = false;

	$effect(() => {
		if (!tipoCitaId && data.tiposCita.length > 0) {
			tipoCitaId = data.tiposCita[0].id;
		}
	});

	const servicioActual = $derived(
		data.tiposCita.find((t) => t.id === tipoCitaId) ?? data.tiposCita[0]
	);

	// 1. Días con disponibilidad real
	const fechasDisponibles = $derived.by(() => {
		const fechas = data.franjas.filter((f) => f.available).map((f) => f.date);
		return [...new Set(fechas)].sort();
	});

	// 2. Franjas del día seleccionado
	const franjasDelDia = $derived.by(() => {
		if (!fechaSeleccionada) return [];
		return data.franjas.filter((f) => f.date === fechaSeleccionada);
	});

	// 3. Bloques consecutivos según la duración del servicio
	const franjasDisponibles = $derived.by(() => {
		const franjas = franjasDelDia;
		const horasNecesarias = servicioActual?.duracionFranjas ?? 1;

		if (horasNecesarias === 1) {
			return franjas
				.filter((f) => f.available)
				.map((f) => ({
					ids: [f.id],
					startTime: f.startTime,
					endTime: f.endTime
				}));
		}

		const resultado = [];
		for (let i = 0; i <= franjas.length - horasNecesarias; i++) {
			const grupo = franjas.slice(i, i + horasNecesarias);

			const consecutivas = grupo.every((actual, idx: number) => {
				if (!actual.available) return false;
				if (idx === grupo.length - 1) return true;
				return actual.endTime === grupo[idx + 1].startTime;
			});

			if (consecutivas) {
				resultado.push({
					ids: grupo.map((g) => g.id),
					startTime: grupo[0].startTime,
					endTime: grupo.at(-1)!.endTime
				});
			}
		}
		return resultado;
	});

	$effect(() => {
		if (!appState.isInitialLoading && mainEl) {
			const ctx = gsap.context(() => {
				const bannerLogo = document.getElementById('banner-logo');
				const bannerImage = document.getElementById('banner-image');
				const bannerTitle = document.getElementById('banner-title');
				const profileImage = document.getElementById('profile-image');
				const bannerText = document.getElementById('banner-text');
				const bannerButtons = document.getElementById('banner-buttons');

				if (bannerLogo) {
					gsap.fromTo(bannerLogo, { opacity: 0, y: -50 }, { opacity: 1, y: 0, duration: 2 });
				}

				if (bannerImage) {
					gsap.fromTo(
						bannerImage,
						{ opacity: 0, scale: 1.25 },
						{ opacity: 0.2, scale: 1, duration: 2 }
					);
				}

				if (bannerTitle) {
					gsap.fromTo(
						bannerTitle,
						{ color: 'white', opacity: 0, y: -100 },
						{ color: '#cd973a', opacity: 1, y: 0, duration: 3, delay: 0.5, ease: 'power3.out' }
					);
				}
				if (bannerText) {
					gsap.fromTo(
						bannerText,
						{ opacity: 0, y: 50 },
						{ opacity: 1, y: 0, duration: 3, delay: 0.5, ease: 'power3.out' }
					);
				}

				if (bannerButtons) {
					gsap.fromTo(
						bannerButtons,
						{ opacity: 0, x: -50 },
						{ opacity: 1, x: 0, duration: 3, delay: 0.5, ease: 'power3.out' }
					);
				}

				if (profileImage) {
					gsap.fromTo(
						profileImage,
						{ scaleY: 0.3, scaleX: 0.5, y: 0, x: 0, opacity: 1 },
						{
							scale: 1,
							opacity: 0.1,
							duration: 1.5,
							ease: 'none',
							scrollTrigger: {
								trigger: profileImage.parentElement,
								scroller: mainEl,
								start: 'top bottom',
								end: 'top top',
								scrub: true
							}
						}
					);
				}
			}, mainEl);

			ScrollTrigger.refresh();
			return () => ctx.revert();
		}
	});

	$effect(() => {
		const shouldShowForm2 = bloqueSeleccionado && servicioActual;
		const target = shouldShowForm2 ? 2 : 1;
		if (target !== currentForm) {
			animateSwitch(target);
			currentForm = target;
		}
	});

	function animateSwitch(target: 1 | 2) {
		const leaving = target === 1 ? form2El : form1El;
		const entering = target === 1 ? form1El : form2El;

		if (!leaving || !entering) return;

		const tl = gsap.timeline({ defaults: { duration: 0.35, ease: 'power3.inOut' } });

		// Salida
		tl.to(leaving, { opacity: 0, y: 20, pointerEvents: 'none', display: 'none' }, 0);

		// Entrada (overlap ligero)
		tl.set(entering, { display: 'block', opacity: 0, y: -20 });
		tl.to(entering, { opacity: 1, y: 0, pointerEvents: 'auto' }, 0.1);
	}
	// Función unificada de transición con la cortina
	const playCurtain = (direction: 'down' | 'up', onMidpoint?: () => void) => {
		if (!transitionOverlay) return;
		isTransitioning = true;

		gsap.killTweensOf(transitionOverlay);

		const startY = direction === 'down' ? 100 : -100;
		const endY = direction === 'down' ? -100 : 100;

		gsap.fromTo(
			transitionOverlay,
			{ yPercent: startY, opacity: 1 },
			{
				yPercent: 0,
				duration: 0.28,
				ease: 'power2.out',
				onComplete: () => {
					if (onMidpoint) onMidpoint();
					gsap.to(transitionOverlay, {
						yPercent: endY,
						duration: 0.28,
						ease: 'power2.in',
						onComplete: () => {
							isTransitioning = false;
						}
					});
				}
			}
		);
	};

	// Event listeners directos para eliminar cualquier retraso en el scroll de la rueda
	$effect(() => {
		if (!mainEl) return;
		const sections = Array.from(mainEl.querySelectorAll('section'));

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					// Cuando una sección ocupa más del 55% de la pantalla
					if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
						const newIndex = sections.indexOf(entry.target as HTMLElement);
						if (newIndex !== -1 && newIndex !== currentSectionIndex) {
							const direction = newIndex > currentSectionIndex ? 'down' : 'up';
							currentSectionIndex = newIndex;

							// Solo dispara la cortina por scroll si no viene de un clic en botón
							if (!isTransitioning) {
								playCurtain(direction);
							}
						}
					}
				}
			},
			{
				root: mainEl,
				threshold: [0.55]
			}
		);

		sections.forEach((sec) => observer.observe(sec));
		return () => observer.disconnect();
	});

	const goToSection = (id: string, targetIndex: number) => {
		if (!mainEl || targetIndex === currentSectionIndex || isTransitioning) return;
		const sections = mainEl.querySelectorAll('section');
		const direction = targetIndex > currentSectionIndex ? 'down' : 'up';

		playCurtain(direction, () => {
			currentSectionIndex = targetIndex;
			sections[targetIndex]?.scrollIntoView({ behavior: 'instant' });
		});
	};
</script>

<main
	bind:this={mainEl}
	class="h-dvh snap-y snap-mandatory overflow-x-hidden overflow-y-auto overscroll-y-none"
>
	<div
		bind:this={transitionOverlay}
		class="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-accent opacity-0"
	>
		<div class="flex flex-col items-center justify-center space-y-3">
			<!-- Monograma AP estilizado (puedes reemplazarlo por tu SVG o imagen en negro) -->
			<div class="font-title text-6xl font-bold tracking-wider">
				<span class="relative inline-block">
					<!-- Aquí puedes usar tu SVG del monograma con color negro -->
					<svg
						class="h-24 w-24 text-black"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 481 555"
						width="481"
						height="555"
						fill="currentColor"
					>
						<path
							id="white-shape-1"
							d="M238 318.02c-8.27 5.91-17.05 26.45-26.63 27.75-11.21-22.36-24-44.75-37.72-65.49-3.72.88-7.7 10.49-9.55 14.04l-22.71 39.42L48.76 493.05c-4.04 2.66-35.45 1.82-42.1.9L6.99 489l37.78-65.42 87.95-155.13 29.31-51.66c1.32-2.39 8.86-17.16 10.28-17.51l4.32 1.14 13.1 24.63 32.36 59.78c5.58 10.93 14.05 21.05 15.91 33.19Z"
						/><path
							id="white-shape-2"
							d="M300.69 401.27l-.12-5.37c1.11-2.77 13.52-24.42 15.01-24.94l15.35-.43c22.17-.23 62.96 5.41 80.41-9.26 7.29-6.12 11.05-15.37 12.12-24.61 3.29-28.46-14.35-44.73-41.49-46.29l-60.52-.47c-4.04-.18-6.16 2.51-10.21.92l7.76-9.99-.55-2.77 1.11-.56-1.11-2.22 4.44-3.88 1.66 1.66c.87-2.85 3.18-3.28 2.22-6.66l-1.67 1.11-1.1-1.66-2.22.55c-2.09-2.64-15.4 1.05-13.17-5.12.96-2.65 10.07-1.14 12.33-1.16l39.95.07 41.6.73c34.99 4.05 63.68 29.76 64.67 66.25.24 9.12-.67 17.84-3.53 26.5-19.03 57.71-84.58 47.48-132.7 47.11Z"
						/><path
							id="white-shape-3"
							d="M265.19 382.95c6.99 2.19 11.54 16.09 14.7 22.21l34.54 63.1c2.24 4.58 13.66 21.64 11.4 25.6-1.08 1.89-7.47.64-9.32.58-6.63-.19-26.08 2.02-30.76-1.32l-12.89-22.66c-9.45-17.22-25.88-41.84-30.97-59.76 8.14-7.49 17.88-18.11 23.3-27.75Z"
						/><path
							id="light-gold"
							d="M309.57 260.3l-.55 1.11c2.59-.72 12.13-.87 12.76 1.66l1.11-1.11 2.77 2.22.55-1.11 3.33.56 1.11 3.33c-.23 3.78-2.46 9.16-6.65 9.43l-1.67-1.11.56 1.11-1.11 1.67 1.11 2.77c-2.77 2.04-12.8 15.72-14.43 18.87l-2.22-1.11.56 2.78L176.45 450.41c-5.57 6.75-33.34 41.04-38.76 43.37-5.66 2.43-16.49 2.28-22.29.73 2.26-10.56 32.44-42.51 41.01-53.04L262.94 312.71c8.56-9.66 37.37-49.96 46.63-52.41Z"
						/>
					</svg>
				</span>
			</div>

			<!-- Texto de la marca en negro para acoplarse al accent -->
			<div class="text-center">
				<h2 class="font-title text-xl font-bold tracking-[0.2em] text-black uppercase">
					Alejandro Piña
				</h2>
				<p class="mt-1 text-xs font-semibold tracking-[0.3em] text-black/70 uppercase">Mentor</p>
			</div>
		</div>
	</div>
	{#if currentSectionIndex < 2}
		<div
			class="fixed bottom-2 left-1/2 flex -translate-x-1/2 animate-bounce flex-col items-center text-xs text-primary uppercase"
		>
			Siguiente
			<Icon icon={DownArrow} class=" h-5 w-5 rotate-180" />
		</div>
	{/if}
	<section class="relative h-screen snap-start snap-always">
		<picture>
			<img
				id="banner-logo"
				src="logotipo.png"
				alt="Logo"
				class="absolute left-1/2 h-32 w-32 -translate-x-1/2 object-cover opacity-0 md:left-0 md:h-40 md:w-40 md:translate-x-0"
			/>
			<img
				id="banner-image"
				src="banner.webp"
				alt="Banner"
				fetchpriority="high"
				class="h-full w-full object-cover opacity-0"
			/>
		</picture>
		<div
			class="absolute top-0 left-1/2 grid w-8/10 max-w-187.5 -translate-x-1/2 translate-y-[18vh] gap-4 text-white md:left-0 md:ml-10
				   md:w-auto md:translate-x-0 md:translate-y-[25vh] md:text-left"
		>
			<Shuffle
				text="Mentor  -  Bienestar  -  Propósito"
				active={currentSectionIndex === 0}
				style="font-size: 20px; font-family: var(--font-title); width: 100%; text-align: justify; color: #a1f1c0;"
				duration={0.4}
				loop={true}
				loopDelay={3}
			/>
			<h1 id="banner-title" class="text-justify font-title text-5xl font-bold uppercase opacity-0">
				Vuelve a elegir <span class="animate-pulse text-accent duration-200">tu vida</span>
			</h1>

			<p id="banner-text" class="text-justify text-xl font-bold text-gray-300 opacity-0">
				Acompaño a personas a recuperar su paz, ordernar sus emociones y reconstruir su camino hacia
				una vida más plena desde la experiencia.
			</p>
		</div>
		<div
			id="banner-buttons"
			class="absolute bottom-[10vh] left-1/2 grid w-8/10 -translate-x-1/2 items-center justify-center gap-4 text-white opacity-0 md:bottom-[18vh] md:left-0 md:ml-10 md:flex md:w-auto md:translate-x-0"
		>
			<button
				onclick={() => goToSection('agenda', 2)}
				class="border-2 border-transparent bg-accent px-4 py-2 text-center text-black uppercase transition duration-300 hover:scale-95 hover:border-primary hover:bg-white hover:text-primary"
				>Reservar sesión</button
			>
			<button
				onclick={() => goToSection('profile', 1)}
				class="border-2 border-white px-4 py-2 text-center text-white uppercase transition duration-300 hover:scale-95 hover:border-accent hover:text-accent"
				>Conoce mi historia</button
			>
		</div>
	</section>
	<section
		id="profile"
		class="relative min-h-screen snap-start snap-always overflow-x-hidden overflow-y-scroll"
	>
		<img
			id="profile-image"
			src="profile.webp"
			alt="Profile"
			loading="lazy"
			class="absolute -z-1 h-full w-full object-cover object-[25%_40%] opacity-0"
		/>
		<img
			src="logotipo.png"
			alt="Logo"
			class="absolute top-0 left-1/2 h-32 w-32 -translate-x-1/2 object-cover md:left-0 md:h-40 md:w-40 md:translate-x-0"
		/>

		<div
			class="relative top-[20vh] left-1/2 mb-20 grid w-8/10 max-w-187.5 -translate-x-1/2 gap-4 text-white md:top-0 md:left-0
				   md:ml-10 md:w-auto md:translate-x-0 md:translate-y-[25vh] md:text-left"
		>
			<Shuffle
				text="Sobre Mi"
				active={currentSectionIndex === 1}
				style="font-size: 20px; font-family: var(--font-title); width: 100%; text-align: justify; color: #a1f1c0;"
				duration={0.4}
				loop={true}
				loopDelay={3}
			/>
			<h2 class="text-justify text-4xl text-white uppercase">
				Mirarte de frente y <span class="text-accent">reconocer los patrones</span>.
			</h2>
			<p>
				Durante mucho tiempo podemos estar viviendo en automático, repetir historias, cargar
				emociones y tomar decisiones sin preguntarnos realmente por qué hacemos lo que hacemos. Yo
				también he tenido que cuestionarme, enfrentar mis propias contradicciones y descubrir que
				cambiar no consiste solamente en querer algo diferente.
			</p>
			<p>
				Hoy quiero poner mi experiencia y mis herramientas al servicio de otras personas. Quizás no
				necesitas otra respuesta. <span class="text-accent"
					>Necesitas empezar a hacerte otras preguntas.</span
				> Un espacio de conversación y acompañamiento para explorar lo que estás viviendo, cuestionar
				aquello que das por sentado y descubrir posibilidades que hoy quizás no estás viendo.
			</p>
			<p>
				Comprende tus emociones, cuestiona tus respuestas habituales y recupera tu capacidad de
				elegir. <span class="text-accent">Construir algo diferente</span> Lleva tus reflexiones a la vida
				cotidiana y comienza a crear cambios que tengan sentido para ti.
			</p>

			<div class="my-4 grid gap-4">
				<h3 class="text-center">Sigueme en redes sociales:</h3>
				<MediaIcons class="w-full justify-around" />
			</div>
		</div>
	</section>
	<section
		id="agenda"
		class="relative flex min-h-dvh snap-start flex-col items-center justify-center py-16"
	>
		<div class="absolute top-1/2 -z-10 h-1/2 w-full -translate-y-1/2 opacity-30">
			<Prisma height={5} baseWidth={10} scale={1} />
		</div>
		<img
			src="logotipo.png"
			alt="Logo"
			class="absolute top-0 left-1/2 h-32 w-32 -translate-x-1/2 object-cover md:left-0 md:h-40 md:w-40 md:translate-x-0"
		/>
		<div bind:this={form1El} class="relative w-[90vw] max-w-3xl text-center text-white">
			<h1 class="mb-4 text-3xl font-bold text-accent uppercase">Agenda tu Sesión</h1>

			{#if form?.error}
				<div class="mb-6 rounded-lg bg-red-100 p-4 text-sm text-red-700">
					{form.error}
				</div>
			{/if}

			{#if data.tiposCita.length === 0}
				<p class="text-gray-500">No hay servicios configurados en este momento.</p>
			{:else if fechasDisponibles.length === 0}
				<p class="text-red-500">No hay disponibilidad de horarios en este momento.</p>
			{:else}
				<!-- PASO 1: TIPO DE CITA -->
				<div class="mb-6 text-left">
					<label for="tipoCita" class="mb-2 block font-semibold"
						>1. Selecciona el tipo de cita:</label
					>
					<select
						id="tipoCita"
						bind:value={tipoCitaId}
						onchange={() => (bloqueSeleccionado = null)}
						class="w-full rounded border p-2.5"
					>
						{#each data.tiposCita as tipo (tipo.id)}
							<option value={tipo.id}>
								{tipo.nombre} ({tipo.duracionFranjas}h) — ${tipo.precio.toLocaleString('es-CO')}
							</option>
						{/each}
					</select>
					{#if servicioActual?.descripcion}
						<p class="mt-1 text-xs text-gray-500">{servicioActual.descripcion}</p>
					{/if}
				</div>

				<!-- PASO 2: FECHA -->
				<div class="mb-6 text-left">
					<label for="fecha" class="mb-2 block font-semibold"
						>2. Selecciona un día disponible:</label
					>
					<select
						id="fecha"
						bind:value={fechaSeleccionada}
						onchange={() => (bloqueSeleccionado = null)}
						class="w-full rounded border p-2.5"
					>
						<option value="" disabled selected>Elige una fecha...</option>
						{#each fechasDisponibles as fecha (fecha)}
							<option value={fecha}>{fecha}</option>
						{/each}
					</select>
				</div>

				<!-- PASO 3: HORARIOS -->
				{#if fechaSeleccionada}
					<div class="mb-6 text-left">
						<p class="mb-3 font-semibold">3. Horarios disponibles para el {fechaSeleccionada}:</p>
						<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
							{#if franjasDisponibles.length === 0}
								<p class="col-span-full text-center text-primary">
									No hay bloques consecutivos suficientes ({servicioActual?.duracionFranjas}h) para
									este servicio en esta fecha.
								</p>
							{:else}
								{#each franjasDisponibles as bloque (bloque.ids.join('-'))}
									{@const seleccionado = bloqueSeleccionado?.ids.join('-') === bloque.ids.join('-')}
									<button
										type="button"
										onclick={() => {
											bloqueSeleccionado = bloque;
											animateSwitch(2);
										}}
										class="w-full rounded-lg border-2 p-3 text-center font-medium transition-colors
								{seleccionado
											? 'border-primary bg-primary text-white'
											: 'border-gray-300 hover:border-primary hover:bg-primary/10'}"
									>
										{bloque.startTime} - {bloque.endTime}
									</button>
								{/each}
							{/if}
						</div>
					</div>
				{/if}
			{/if}
		</div>
		{#if bloqueSeleccionado && servicioActual}
			<div
				bind:this={form2El}
				class="relative top-[10vh] mb-20 w-[90vw] max-w-3xl text-center text-white md:top-0"
			>
				<button onclick={() => animateSwitch(1)} class="mx-auto flex gap-2 p-4"
					>Cancelar <span class="rotate-45 text-xl text-red-500"><Icon icon={Cross} /></span
					></button
				>
				<form
					method="POST"
					action="?/reservar"
					use:enhance={() => {
						enviando = true;
						return async ({ update }) => {
							await update();
							enviando = false;
						};
					}}
					class=""
				>
					<h2 class="mb-4 text-center text-xl font-bold">
						Confirma tu datos para agendar {servicioActual.nombre} el {fechaSeleccionada} a las {bloqueSeleccionado.startTime}
					</h2>

					<input type="hidden" name="franjasIds" value={JSON.stringify(bloqueSeleccionado.ids)} />
					<input type="hidden" name="tipoCitaId" value={servicioActual.id} />

					<div class="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div class="col-span-2">
							<label for="nombre" class="block text-sm font-medium">Nombre completo *</label>
							<input
								id="nombre"
								type="text"
								name="nombre"
								title="Ingresa tu nombre completo"
								placeholder="Ej. Juan Pérez"
								required
								class="mt-1 w-full rounded border p-2"
							/>
						</div>
						<div class="col-span-2 flex-col content-center gap-2 self-center md:col-span-1">
							<label for="indicativo" class="block text-sm font-medium">Indicativo</label>
							<select
								aria-label="Indicativo de país"
								title="Selecciona el indicativo de tu país"
								name="indicativo"
								class="w-28 rounded border p-2 text-sm"
							>
								<option value="+57">🇨🇴 +57</option>
								<option value="+1">🇺🇸 +1</option>
								<option value="+34">🇪🇸 +34</option>
								<option value="+51">🇵🇪 +51</option>
								<option value="+52">🇲🇽 +52</option>
								<option value="+54">🇦🇷 +54</option>
								<option value="+56">🇨🇱 +56</option>
								<option value="+593">🇪🇨 +593</option>
							</select>
						</div>
						<div>
							<label for="telefono" class="block text-sm font-medium">Teléfono / WhatsApp *</label>
							<input
								id="telefono"
								type="tel"
								name="telefono"
								required
								minlength="7"
								maxlength="15"
								title="Ingresa un número de teléfono válido (mínimo 7 dígitos)"
								placeholder="Ej. 3001234567"
								class="mt-1 w-full rounded border p-2"
							/>
						</div>
					</div>

					<div class="mb-4">
						<label for="email" class="block text-sm font-medium">Correo electrónico *</label>
						<input
							id="email"
							type="email"
							name="email"
							title="Ingresa un correo electrónico válido"
							placeholder="Ej. joseelmago@dominio.com"
							required
							class="mt-1 w-full rounded border p-2"
						/>
					</div>

					<div class="mb-6">
						<label for="notasCliente" class="block text-sm font-medium"
							>Notas o comentarios (opcional)</label
						>
						<textarea
							id="notasCliente"
							name="notasCliente"
							title="Hay algo que debamos saber antes de tu cita?"
							rows="2"
							class="mt-1 w-full rounded border p-2"></textarea>
					</div>

					<button
						type="submit"
						disabled={enviando}
						class="w-full rounded-lg bg-accent py-3 font-bold text-white transition hover:scale-95 hover:bg-accent/90 disabled:opacity-50"
					>
						{enviando
							? 'Redirigiendo a Mercado Pago...'
							: `Pagar $${servicioActual.precio.toLocaleString('es-CO')} y Agendar`}
					</button>
				</form>
			</div>
		{/if}

		<Footer class="absolute bottom-0" />
	</section>
</main>
