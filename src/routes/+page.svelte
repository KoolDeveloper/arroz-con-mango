<script lang="ts">
	import gsap from 'gsap';
	import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
	import Shuffle from '$lib/components/ui/Shuffle.svelte';
	import { appState } from '$lib/stores/appState.svelte';
	import Prisma from '$lib/components/ui/Prisma.svelte';

	gsap.registerPlugin(ScrollTrigger);
	let mainEl: HTMLElement;

	$effect(() => {
		if (!appState.isInitialLoading && mainEl) {
			const ctx = gsap.context(() => {
				const bannerLogo = document.getElementById('banner-logo');
				const bannerImage = document.getElementById('banner-image');
				const bannerTitle = document.getElementById('banner-title');
				const profileImage = document.getElementById('profile-image');
				const bannerText = document.getElementById('banner-text');

				if (bannerLogo) {
					gsap.fromTo(bannerLogo, { opacity: 0, y: -50 }, { opacity: 1, y: 0, duration: 2 });
				}

				if (bannerImage) {
					gsap.fromTo(
						bannerImage,
						{ opacity: 0, scale: 1.25 },
						{
							opacity: 0.2,
							scale: 1,
							duration: 2
						}
					);
				}

				if (bannerTitle) {
					gsap.fromTo(
						bannerTitle,
						{ color: 'white', opacity: 0, y: -100 },
						{
							color: '#cd973a',
							opacity: 1,
							y: 0,
							duration: 3,
							delay: 0.5,
							ease: 'power3.out'
						}
					);
				}
				if (bannerText) {
					gsap.fromTo(
						bannerText,
						{ opacity: 0, y: 50 },
						{
							opacity: 1,
							y: 0,
							duration: 3,
							delay: 0.5,
							ease: 'power3.out'
						}
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
</script>

<main
	bind:this={mainEl}
	class="h-screen snap-y snap-mandatory overflow-x-hidden overflow-y-scroll scroll-smooth"
>
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
	</section>
	<section class="relative h-screen snap-start snap-always">
		<img
			id="profile-image"
			src="profile.jpeg"
			alt="Profile"
			class="absolute h-full w-full object-cover object-[25%_40%] opacity-0"
		/>
	</section>
	<section class="h-screen snap-start snap-always"><Prisma height={70} /></section>
</main>
