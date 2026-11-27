import gsap from 'gsap';

export const prefersReducedMotion = () =>
	typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Como gsap.fromTo, pero salta directo al estado final con prefers-reduced-motion. */
export function tweenOrSet(el: Element | null, from: gsap.TweenVars, to: gsap.TweenVars) {
	if (!el) return;
	if (prefersReducedMotion()) {
		const target: gsap.TweenVars = { ...to };
		delete target.scrollTrigger;
		delete target.duration;
		delete target.delay;
		delete target.ease;
		delete target.onComplete;
		gsap.set(el, target);
		return;
	}
	gsap.fromTo(el, from, to);
}
