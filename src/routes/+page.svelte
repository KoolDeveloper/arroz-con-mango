<script lang="ts">
	import gsap from 'gsap';
	import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
	import Shuffle from '$lib/components/ui/Shuffle.svelte';
	import { appState } from '$lib/stores/appState.svelte';
	import Prisma from '$lib/components/ui/Prisma.svelte';

	gsap.registerPlugin(ScrollTrigger);
	let mainEl: HTMLElement;
	let transitionOverlay: HTMLElement;

	let currentSectionIndex = $state(0);
	let isTransitioning = false;
	let touchStartY = 0;

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
	// Función unificada de transición con la cortina
	const playCurtain = (direction: 'down' | 'up', onMidpoint?: () => void) => {
		if (isTransitioning) return;
		isTransitioning = true;

		gsap.killTweensOf(transitionOverlay);

		const startY = direction === 'down' ? 100 : -100;
		const endY = direction === 'down' ? -100 : 100;

		gsap.fromTo(
			transitionOverlay,
			{ yPercent: startY, opacity: 1 },
			{
				yPercent: 0,
				duration: 0.3,
				ease: 'power2.inOut',
				onComplete: () => {
					if (onMidpoint) onMidpoint();
					gsap.to(transitionOverlay, {
						yPercent: endY,
						duration: 0.3,
						ease: 'power2.inOut',
						onComplete: () => {
							isTransitioning = false;
						}
					});
				}
			}
		);
	};

	// Cambio de sección controlado sin delay por scroll nativo
	const changeSection = (targetIndex: number) => {
		const sections = mainEl.querySelectorAll('section');
		if (
			targetIndex < 0 ||
			targetIndex >= sections.length ||
			targetIndex === currentSectionIndex ||
			isTransitioning
		) {
			return;
		}

		const direction = targetIndex > currentSectionIndex ? 'down' : 'up';
		playCurtain(direction, () => {
			currentSectionIndex = targetIndex;
			sections[targetIndex].scrollIntoView({ behavior: 'auto' });
		});
	};

	// Event listeners directos para eliminar cualquier retraso en el scroll de la rueda
	$effect(() => {
		if (!mainEl) return;

		const handleWheel = (e: WheelEvent) => {
			e.preventDefault();
			if (isTransitioning) return;

			if (e.deltaY > 20) {
				changeSection(currentSectionIndex + 1);
			} else if (e.deltaY < -20) {
				changeSection(currentSectionIndex - 1);
			}
		};

		const handleTouchStart = (e: TouchEvent) => {
			touchStartY = e.touches[0].clientY;
		};

		const handleTouchMove = (e: TouchEvent) => {
			if (isTransitioning) return;
			const touchEndY = e.touches[0].clientY;
			const diff = touchStartY - touchEndY;

			if (Math.abs(diff) > 40) {
				if (diff > 0) {
					changeSection(currentSectionIndex + 1);
				} else {
					changeSection(currentSectionIndex - 1);
				}
				touchStartY = touchEndY;
			}
		};

		mainEl.addEventListener('wheel', handleWheel, { passive: false });
		mainEl.addEventListener('touchstart', handleTouchStart, { passive: true });
		mainEl.addEventListener('touchmove', handleTouchMove, { passive: false });

		return () => {
			mainEl.removeEventListener('wheel', handleWheel);
			mainEl.removeEventListener('touchstart', handleTouchStart);
			mainEl.removeEventListener('touchmove', handleTouchMove);
		};
	});

	const goToSection = (id: string, targetIndex: number) => {
		changeSection(targetIndex);
	};
</script>

<main
	bind:this={mainEl}
	class="h-screen snap-y snap-mandatory overflow-x-hidden overflow-y-scroll scroll-smooth"
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
					<svg class="h-24 w-24 text-black" viewBox="0 0 100 100" fill="currentColor">
						<!-- Ejemplo esquemático del monograma AP adaptado a negro -->
						<path
							d="M20 80 L50 20 L80 80 M35 55 H65"
							stroke="currentColor"
							stroke-width="8"
							fill="none"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
						<path
							d="M 20 85 L 55 20"
							stroke="currentColor"
							stroke-width="8"
							fill="none"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
						<path
							d="M 45 85 L 95 20"
							stroke="currentColor"
							stroke-width="8"
							fill="none"
							stroke-linejoin="round"
						/>
						<path
							d="M 80 35 L 105 35 C 122 35 122 62 105 62 L 70 62"
							stroke="currentColor"
							stroke-width="8"
							fill="none"
							stroke-linejoin="round"
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
	<section class="relative h-screen snap-start snap-always">
		<picture>
			<img
				id="banner-logo"
				src="logotipo.png"
				alt="Logo"
				class="fixed left-1/2 h-40 w-40 -translate-x-1/2 object-cover opacity-0 md:left-0 md:translate-x-0"
			/>
			<img
				id="banner-image"
				src="banner.jpg"
				alt="Banner"
				class="h-full w-full object-cover opacity-0"
			/>
		</picture>
		<div
			class="absolute top-0 left-1/2 grid w-8/10 max-w-187.5 -translate-x-1/2 translate-y-[20vh] gap-4 text-white md:left-0 md:ml-10
				   md:w-auto md:translate-x-0 md:translate-y-[25vh] md:text-left"
		>
			<Shuffle
				text="Mentor  -  Bienestar  -  Propósito"
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
			class="absolute bottom-[18vh] left-1/2 grid w-8/10 -translate-x-1/2 items-center justify-center gap-4 text-white opacity-0 md:left-0 md:ml-10 md:flex md:w-auto md:translate-x-0"
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
	<section id="profile" class="relative h-screen snap-start snap-always">
		<img
			id="profile-image"
			src="profile.jpeg"
			alt="Profile"
			class="absolute h-full w-full object-cover object-[25%_40%] opacity-0"
		/>
	</section>
	<section id="agenda" class="relative h-screen snap-start snap-always">
		<div class="absolute top-1/2 h-1/2 w-full -translate-y-1/2">
			<Prisma height={5} baseWidth={10} scale={1} />
		</div>
	</section>
</main>
