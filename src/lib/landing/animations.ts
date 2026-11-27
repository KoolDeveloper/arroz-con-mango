import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { tweenOrSet } from './motion';

gsap.registerPlugin(ScrollTrigger);

const ENTRADA = { duration: 1.4, delay: 0.15, ease: 'power3.out' };

/**
 * Animaciones de la landing:
 * - `[data-intro="..."]`: entrada del hero.
 * - `[data-parallax]`: fondo que crece y se desvanece al hacer scroll.
 * Devuelve la función de limpieza.
 */
export function setupLandingAnimations(scroller: HTMLElement): () => void {
	const q = (name: string) => scroller.querySelector(`[data-intro="${name}"]`);

	const ctx = gsap.context(() => {
		tweenOrSet(
			q('logo'),
			{ opacity: 0, y: -50 },
			{ opacity: 1, y: 0, duration: 1.1, ease: 'power3.out' }
		);
		tweenOrSet(
			q('image'),
			{ opacity: 0, scale: 1.25 },
			{ opacity: 0.2, scale: 1, duration: 1.2, ease: 'power2.out' }
		);
		tweenOrSet(
			q('title'),
			{ color: 'white', opacity: 0, y: -100 },
			{ color: '#cd973a', opacity: 1, y: 0, ...ENTRADA }
		);
		tweenOrSet(q('text'), { opacity: 0, y: 50 }, { opacity: 1, y: 0, ...ENTRADA });
		tweenOrSet(q('buttons'), { opacity: 0, x: -50 }, { opacity: 1, x: 0, ...ENTRADA });

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
