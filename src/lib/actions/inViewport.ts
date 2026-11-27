import type { Action } from 'svelte/action';

type Options = { rootMargin?: string } | undefined;

/**
 * Pone el atributo `data-inview` en el nodo mientras sea visible.
 * Úsalo en CSS para pausar animaciones fuera de pantalla:
 *   .x:not([data-inview]) * { animation-play-state: paused; }
 * Arranca sin el atributo, así que todo empieza en pausa hasta que se ve.
 */
export const inViewport: Action<HTMLElement, Options> = (node, options) => {
	const observer = new IntersectionObserver(
		([entry]) => node.toggleAttribute('data-inview', entry.isIntersecting),
		{ rootMargin: options?.rootMargin ?? '0px', threshold: 0 }
	);
	observer.observe(node);
	return { destroy: () => observer.disconnect() };
};
