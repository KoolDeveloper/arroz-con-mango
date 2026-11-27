import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { tweenOrSet } from './motion';

gsap.registerPlugin(ScrollTrigger);

/** Entrada corta y escalonada: desplazamientos pequeños = menos área a recomponer. */
const entrada = (delay: number) => ({ duration: 0.9, delay, ease: 'power3.out' });

/**
 * Animaciones de la landing:
 * - `[data-intro="..."]`: entrada del hero.
 * - `[data-parallax]`: fondo que crece y se desvanece al hacer scroll.
 * Solo se animan transform y opacity (compositor de la GPU, sin repintar).
 * Devuelve la función de limpieza.
 */
export function setupLandingAnimations(scroller: HTMLElement): () => void {
	const q = (name: string) => scroller.querySelector(`[data-intro="${name}"]`);

	const ctx = gsap.context(() => {
		// El fondo solo hace fade: escalarlo obligaría a re-rasterizar una capa a pantalla completa
		tweenOrSet(q('image'), { opacity: 0 }, { opacity: 1, duration: 1, ease: 'power1.out' });
		tweenOrSet(q('logo'), { opacity: 0, y: -20 }, { opacity: 1, y: 0, ...entrada(0) });
		tweenOrSet(q('title'), { opacity: 0, y: -24 }, { opacity: 1, y: 0, ...entrada(0.1) });
		tweenOrSet(q('text'), { opacity: 0, y: 20 }, { opacity: 1, y: 0, ...entrada(0.2) });
		tweenOrSet(q('buttons'), { opacity: 0, y: 20 }, { opacity: 1, y: 0, ...entrada(0.3) });

		scroller.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
			tweenOrSet(
				el,
				{ scaleY: 0.3, scaleX: 0.5, y: 0, x: 0, opacity: 1 },
				{
					scale: 1,
					opacity: 0.1,
					duration: 1.5,
					ease: 'none',
					scrollTrigger: {
						trigger: el.parentElement,
						scroller,
						start: 'top bottom',
						end: 'top top',
						scrub: true
					}
				}
			);
		});
	}, scroller);

	ScrollTrigger.refresh();
	return () => ctx.revert();
}
