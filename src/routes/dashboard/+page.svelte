<script lang="ts">
	import { formatearPrecio } from '$lib/formato';
	import { resolve } from '$app/paths';

	let { data } = $props();
	let metricas = $derived(data.metricas);
</script>

<h1 class="mb-8 text-4xl text-accent md:text-5xl">Resumen General</h1>

<section class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
	<a href={resolve('/dashboard/pagos')} class="panel transition hover:border-accent/40">
		<h3 class="text-sm font-medium text-white/50">Ingresos Totales →</h3>
		<p class="mt-2 font-title text-5xl text-secondary">
			{formatearPrecio(metricas.ingresosTotales)}
		</p>
	</a>

	<a href={resolve('/dashboard/franjas')} class="panel transition hover:border-accent/40">
		<h3 class="text-sm font-medium text-white/50">Franjas Libres →</h3>
		<p class="mt-2 font-title text-5xl text-accent">{metricas.totalFranjasLibres}</p>
	</a>

	<a href={resolve('/dashboard/citas')} class="panel transition hover:border-accent/40">
		<h3 class="text-sm font-medium text-white/50">Clientes →</h3>
		<p class="mt-2 font-title text-5xl text-accent">{metricas.totalPacientes}</p>
	</a>

	<a href={resolve('/dashboard/citas')} class="panel transition hover:border-accent/40">
		<h3 class="text-sm font-medium text-white/50">Citas Recientes →</h3>
		<p class="mt-2 font-title text-5xl text-accent">{metricas.citasRecientes.length}</p>
	</a>
</section>

<div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
	<div class="panel">
		<div class="mb-4 flex items-center justify-between">
			<h2 class="text-2xl text-white">Últimas Citas</h2>
			<a href={resolve('/dashboard/citas')} class="link-action text-sm"> Ver todas </a>
		</div>
		<table class="data-table">
			<thead>
				<tr>
					<th class="p-3">ID Cliente</th>
					<th class="p-3">Estado</th>
					<th class="p-3">Pago</th>
				</tr>
			</thead>
			<tbody>
				{#each metricas.citasRecientes as cita (cita.id)}
					<tr>
						<td class="p-3 font-mono text-xs">{cita.usuarioId.substring(0, 8)}...</td>
						<td class="p-3">{cita.estadoCita}</td>
						<td class="p-3">{cita.estadoPago}</td>
					</tr>
				{:else}
					<tr>
						<td colspan="3" class="p-4 text-center text-white/50">No hay citas recientes.</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<div class="panel">
		<div class="mb-4 flex items-center justify-between">
			<h2 class="text-2xl text-white">Últimas Transacciones</h2>
			<a href={resolve('/dashboard/pagos')} class="link-action text-sm"> Ver todas </a>
		</div>
		<table class="data-table">
			<thead>
				<tr>
					<th class="p-3">Ref. Pago (MP)</th>
					<th class="p-3">Monto</th>
					<th class="p-3">Estado</th>
				</tr>
			</thead>
			<tbody>
				{#each metricas.pagosRecientes as pago (pago.id)}
					<tr>
						<td class="p-3 font-mono text-xs">{pago.mercadoPagoId}</td>
						<td class="p-3 font-medium">{formatearPrecio(pago.amount)}</td>
						<td class="p-3">{pago.status}</td>
					</tr>
				{:else}
					<tr>
						<td colspan="3" class="p-4 text-center text-white/50">No hay pagos registrados.</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
