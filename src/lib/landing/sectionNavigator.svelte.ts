export type Direccion = 'down' | 'up';

/** Animación de transición entre secciones; resuelve cuando termina. */
export type Transicion = (direccion: Direccion, onMidpoint?: () => void) => Promise<void>;

/**
 * Lleva el índice de la sección visible dentro de un contenedor con scroll-snap
 * y dispara una transición al cambiar de sección (por scroll o por botón).
 */
export class SectionNavigator {
	current = $state(0);
	#busy = false;
	#scroller?: HTMLElement;
	#transicion: Transicion;

	constructor(transicion: Transicion) {
		this.#transicion = transicion;
	}

	async #play(dir: Direccion, onMidpoint?: () => void) {
		this.#busy = true;
		try {
			await this.#transicion(dir, onMidpoint);
		} finally {
			this.#busy = false;
		}
	}

	#sections() {
		return Array.from(this.#scroller?.querySelectorAll(':scope > section') ?? []);
	}

	/** Observa las secciones hijas directas del contenedor; devuelve la limpieza. */
	observe(scroller: HTMLElement): () => void {
		this.#scroller = scroller;
		const sections = this.#sections();

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (!entry.isIntersecting || entry.intersectionRatio < 0.55) continue;
					const idx = sections.indexOf(entry.target);
					if (idx === -1 || idx === this.current) continue;
					const dir: Direccion = idx > this.current ? 'down' : 'up';
					this.current = idx;
					// Solo animamos por scroll si no viene de un clic en botón
					if (!this.#busy) this.#play(dir);
				}
			},
			{ root: scroller, threshold: [0.55] }
		);

		sections.forEach((s) => observer.observe(s));
		return () => observer.disconnect();
	}

	goTo(index: number) {
		if (index === this.current || this.#busy) return;
		const dir: Direccion = index > this.current ? 'down' : 'up';
		this.#play(dir, () => {
			this.current = index;
			this.#sections()[index]?.scrollIntoView({ behavior: 'instant' });
		});
	}
}
