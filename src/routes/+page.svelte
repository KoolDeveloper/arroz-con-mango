<script lang="ts">
	import { onMount } from 'svelte';
	import gsap from 'gsap';
	import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
	import Shuffle from '$lib/components/ui/Shuffle.svelte';

	gsap.registerPlugin(ScrollTrigger);

	onMount(() => {
		const bannerLogo = document.getElementById('banner-logo');
		const bannerImage = document.getElementById('banner-image');
		const bannerTitle = document.getElementById('banner-title');
		const profileImage = document.getElementById('profile-image');

		if (bannerLogo) {
			// Animación normal del logo al cargar la página
			gsap.fromTo(bannerLogo, { opacity: 0, y: -50 }, { opacity: 1, y: 0, duration: 2 });
		}

		if (bannerImage) {
			// Animación vinculada al scroll
			gsap.fromTo(
				bannerImage,
				{ opacity: 0, y: 50 },
				{
					opacity: 1,
					y: 0,
					duration: 2,
					yoyo: true,
					scrollTrigger: {
						trigger: bannerImage, // Elemento que activa la animación
						start: 'top 30%', // Empieza cuando el top del banner-image llega al 80% de la pantalla
						end: 'top 30%', // (Opcional) Dónde termina el rango de vinculación
						toggleActions: 'play none none none' // Qué hacer al entrar/salir (play, pause, resume, reverse)
						// markers: true      // Descomenta esto temporalmente para ver las líneas guía visuales
					}
				}
			);
		}

		if (bannerTitle) {
			gsap.fromTo(
				bannerTitle,
				{ color: 'white', opacity: 0, y:-100 },
				{
					color: '#cd973a',
					opacity: 1,
					y: 0,
					duration: 3,
					delay: 0.5,
					yoyo: true,
					ease: 'bounce'
				}
			);
		}

		if (profileImage){
			gsap.fromTo(
				profileImage,
				{ scale: 1 , y: 0, opacity: 1},
		
				{
					scale:0.4,
					y:-240,
					opacity: 0,
					duration: 3,
					scrollTrigger: {
						trigger: profileImage,
						start: 'top 30%',
						end: 'top 20%',
						scrub: true
					}
				}
			);
		}
	});
</script> 

<main class="overflow-x-hidden">
	<section class="relative h-screen">
		<picture>
			<img
				id="banner-logo"
				src="logotipo.png"
				alt="Logo"
				class="fixed left-1/2 h-40 w-40 -translate-x-1/2 object-cover"
			/>
			<img id="bannerImage" src="banner.jpg" alt="Banner" class="h-full w-full object-cover" />
		</picture>
		<div class="absolute top-0 w-auto max-w-187.5 left-1/2 -translate-x-1/2 translate-y-[25vh] text-center">
			<h1 id="banner-title" class="text-justify font-bold text-white">
				<Shuffle text="Liberate de la ludopatia"  style='font-size: 52px;' loop={true} loopDelay={3} />
			</h1>
		</div>
	</section>
	<section class="h-screen relative">
		<img id="profile-image" src="profile.jpeg" alt="Profile" class="absolute h-full w-full object-cover" />
	</section>
	<section class="h-screen">Third</section>
</main>
