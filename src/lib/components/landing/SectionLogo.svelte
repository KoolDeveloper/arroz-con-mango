<script lang="ts">
	import { asset, resolve } from '$app/paths';

	let { intro = false }: { intro?: boolean } = $props();
</script>

<a href={resolve('/')} aria-label="Inicio">
	<img
		src={asset('/logotipo.png')}
		alt="Logo"
		data-intro={intro ? 'logo' : undefined}
		class="absolute top-0 left-1/2 h-32 w-32 -translate-x-1/2 object-cover md:left-0 md:h-40 md:w-40 md:translate-x-0
			{intro ? 'opacity-0' : ''}"
	/>
</a>
