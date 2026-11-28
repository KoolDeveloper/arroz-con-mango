<script lang="ts">
	import { page } from '$app/state';
	import { asset, resolve } from '$app/paths';

	let { children } = $props();

	const navItems = [
		{ id: '/dashboard', label: 'Resumen General', exact: true },
		{ id: '/dashboard/citas', label: 'Citas y Catálogo', exact: false },
		{ id: '/dashboard/franjas', label: 'Franjas Horarias', exact: false },
		{ id: '/dashboard/pagos', label: 'Pagos y Finanzas', exact: false },
		{ id: '/dashboard/talleres', label: 'Talleres', exact: false }
	] as const;
</script>

<div class="relative flex min-h-dvh flex-col text-white md:flex-row">
	<div
		class="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(255,172,31,0.08),transparent_60%)]"
	></div>

	<aside
		class="border-b border-white/10 bg-black/40 p-4 md:w-64 md:shrink-0 md:border-r md:border-b-0 md:p-6"
	>
		<div class="mb-4 flex items-center gap-3 md:mb-8 md:block">
			<a href={resolve('/')} aria-label="Inicio">
				<img
					src={asset('/logotipo.png')}
					alt="Logo"
					class="h-14 w-14 object-cover md:h-20 md:w-20"
				/>
			</a>
			<div>
				<h2 class="text-3xl text-accent">Dashboard</h2>
				<span class="badge badge-ok mt-1">Zero Trust activo</span>
			</div>
		</div>

		<nav class="flex gap-2 overflow-x-auto md:flex-col">
			{#each navItems as item (item.id)}
				{@const href = resolve(item.id)}
				{@const isActive = item.exact
					? page.url.pathname === href
					: page.url.pathname.startsWith(href)}
				<a
					{href}
					class="rounded-full px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors
					{isActive ? 'bg-accent text-black' : 'text-white/60 hover:bg-white/10 hover:text-white'}"
				>
					{item.label}
				</a>
			{/each}
		</nav>
	</aside>

	<main class="min-w-0 flex-1 p-4 md:p-8">
		{@render children()}
	</main>
</div>
