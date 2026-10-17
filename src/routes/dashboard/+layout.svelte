<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';

	let { children } = $props();

	const navItems = [
		{ id: '/dashboard', label: 'Resumen General', exact: true },
		{ id: '/dashboard/citas', label: 'Citas y Catálogo', exact: false },
		{ id: '/dashboard/franjas', label: 'Franjas Horarias', exact: false },
		{ id: '/dashboard/pagos', label: 'Pagos y Finanzas', exact: false }
	] as const;
</script>

<div class="flex min-h-screen bg-gray-50">
	<aside class="w-64 border-r bg-white p-6 shadow-sm">
		<div class="mb-8">
			<h2 class="text-2xl font-bold text-gray-800">Dashboard</h2>
			<span
				class="mt-2 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800"
			>
				Zero Trust Activo
			</span>
		</div>

		<nav class="space-y-2">
			{#each navItems as item (item.id)}
				{@const href = resolve(item.id)}
				{@const isActive = item.exact
					? page.url.pathname === href
					: page.url.pathname.startsWith(href)}
				<a
					{href}
					class="block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors
					{isActive ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}"
				>
					{item.label}
				</a>
			{/each}
		</nav>
	</aside>

	<main class="flex-1 p-8">
		{@render children()}
	</main>
</div>
