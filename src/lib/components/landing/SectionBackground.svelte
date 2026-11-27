<script lang="ts">
	/** Imagen de fondo con efecto parallax (ver $lib/landing/animations). */
	type Props = {
		src: string;
		alt: string;
		/** Clases de object-position para encuadrar la imagen (pasar clases literales de Tailwind). */
		position?: string;
	};
	let { src, alt, position = 'object-[25%_40%]' }: Props = $props();
</script>

<img
	{src}
	{alt}
	data-parallax
	loading="lazy"
	class="absolute -z-1 h-full w-full object-cover opacity-0 {position}"
/>
