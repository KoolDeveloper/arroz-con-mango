<script lang="ts">
	import { resolve, asset } from '$app/paths';
	import { page } from '$app/state';
	import Icon from '@iconify/svelte';

	const TITLES: Record<string, string> = {
		'/': 'Inicio',
		'/aplicacion/agenda': 'Agenda',
		'/aplicacion/about': 'Sobre Mi'
	};

	const title = $derived(TITLES[page.url.pathname] || 'Alejo Coach');

	let isHidden = $state(true);
</script>

<header
	class="relative flex h-20 items-center justify-between border-b-2 border-primary bg-black px-6 py-4 text-white"
>
	<a href={resolve('/')} aria-label="Inicio"
		><img class="h-12 w-16" src={asset('/logotipo.png')} alt="Logo Arroz Con Mango" /></a
	>
	<p class="text-center text-xl font-bold">{title}</p>
	<button class="md:hidden" onclick={() => (isHidden = !isHidden)}>
		<Icon icon="mdi:menu" class="h-8 w-8" />
	</button>
	<nav
		class={`${isHidden ? 'hidden' : 'absolute top-full left-1/2 w-[75vw] -translate-x-1/2'} border-r-2  border-b-2 border-l-2 border-primary bg-black text-center transition-all md:static md:block md:w-auto md:translate-0 md:border-0`}
	>
		<ul class="gap-4 text-lg font-semibold md:flex md:gap-8">
			<li class="hover:text-primary hover:underline">
				<a href={resolve('/')}>Inicio</a>
			</li>
			<li class="hover:text-primary hover:underline">
				<a onclick={() => (isHidden = !isHidden)} href={resolve('/aplicacion/agenda')}>Agenda</a>
			</li>
			<li class="hover:text-primary hover:underline">
				<a onclick={() => (isHidden = !isHidden)} href={resolve('/aplicacion/about')}>Sobre Mi</a>
			</li>
		</ul>
	</nav>
</header>
