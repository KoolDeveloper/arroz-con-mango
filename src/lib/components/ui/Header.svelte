<script lang="ts">
	import { resolve, asset } from '$app/paths';
	import { page } from '$app/state';

	const TITLES: Record<string, string> = {
		'/': 'Inicio',
		'/aplicacion/agenda': 'Agenda',
		'/aplicacion/about': 'Sobre Mi'
	};

	const title = $derived(TITLES[page.url.pathname] || 'Alejo Coach');
</script>

<header class="flex items-center justify-between bg-black px-6 py-4 text-white">
	<a href={resolve('/')} aria-label="Inicio"
		><img class="h-12 w-16" src={asset('/logotipo.png')} alt="Logo Arroz Con Mango" /></a
	>
	<p class="text-xl font-bold text-center">{title}</p>
	<nav>
		<ul class="flex space-x-4 text-lg font-semibold">
			<li><a href={resolve('/')}>Inicio</a></li>
			<li><a href={resolve('/aplicacion/about')}>Sobre Mi</a></li>
			<li><a href={resolve('/aplicacion/agenda')}>Agenda</a></li>
		</ul>
	</nav>
</header>
