<script lang="ts">
	/** Imagen de fondo con efecto parallax (ver $lib/landing/animations). */
	let { src, alt }: { src: string; alt: string } = $props();
</script>

<img
	{src}
	{alt}
	data-parallax
	loading="lazy"
	class="absolute -z-1 h-full w-full object-cover object-[25%_40%] opacity-0"
/>
