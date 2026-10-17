<script lang="ts">
	import { resolve } from '$app/paths';

	let { data } = $props();
	let metricas = $derived(data.metricas);
</script>

<h1 class="mb-8 text-3xl font-bold text-gray-800">Resumen General</h1>

<section class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
	<a
		href={resolve('/dashboard/pagos')}
		class="rounded-lg bg-white p-6 shadow transition hover:shadow-md"
	>
		<h3 class="text-sm font-medium text-gray-500">Ingresos Totales →</h3>
		<p class="mt-2 text-3xl font-bold text-green-600">
			${metricas.ingresosTotales.toLocaleString('es-CO')}
		</p>
	</a>

	<a
		href={resolve('/dashboard/franjas')}
		class="rounded-lg bg-white p-6 shadow transition hover:shadow-md"
	>
		<h3 class="text-sm font-medium text-gray-500">Franjas Libres →</h3>
		<p class="mt-2 text-3xl font-bold text-primary">{metricas.totalFranjasLibres}</p>
	</a>

	<a
		href={resolve('/dashboard/citas')}
		class="rounded-lg bg-white p-6 shadow transition hover:shadow-md"
	>
		<h3 class="text-sm font-medium text-gray-500">Pacientes →</h3>
		<p class="mt-2 text-3xl font-bold text-primary">{metricas.totalPacientes}</p>
	</a>

	<a
		href={resolve('/dashboard/citas')}
		class="rounded-lg bg-white p-6 shadow transition hover:shadow-md"
	>
		<h3 class="text-sm font-medium text-gray-500">Citas Recientes →</h3>
		<p class="mt-2 text-3xl font-bold text-primary">{metricas.citasRecientes.length}</p>
	</a>
</section>

<div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
	<div class="rounded-lg bg-white p-6 shadow">
		<div class="mb-4 flex items-center justify-between">
			<h2 class="text-xl font-semibold">Últimas Citas</h2>
			<a href={resolve('/dashboard/citas')} class="text-sm text-primary hover:underline">
				Ver todas
			</a>
		</div>
		<table class="w-full text-left text-sm">
			<thead class="bg-gray-100 text-gray-600">
				<tr>
					<th class="p-3">ID Paciente</th>
					<th class="p-3">Estado</th>
					<th class="p-3">Pago</th>
				</tr>
			</thead>
			<tbody>
				{#each metricas.citasRecientes as cita (cita.id)}
					<tr class="border-b">
						<td class="p-3 font-mono text-xs">{cita.pacienteId.substring(0, 8)}...</td>
						<td class="p-3">{cita.estadoCita}</td>
						<td class="p-3">{cita.estadoPago}</td>
					</tr>
				{:else}
					<tr>
						<td colspan="3" class="p-4 text-center text-gray-500">No hay citas recientes.</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<div class="rounded-lg bg-white p-6 shadow">
		<div class="mb-4 flex items-center justify-between">
			<h2 class="text-xl font-semibold">Últimas Transacciones</h2>
			<a href={resolve('/dashboard/pagos')} class="text-sm text-primary hover:underline">
				Ver todas
			</a>
		</div>
		<table class="w-full text-left text-sm">
			<thead class="bg-gray-100 text-gray-600">
				<tr>
					<th class="p-3">Ref. Pago (MP)</th>
					<th class="p-3">Monto</th>
					<th class="p-3">Estado</th>
				</tr>
			</thead>
			<tbody>
				{#each metricas.pagosRecientes as pago (pago.id)}
					<tr class="border-b">
						<td class="p-3 font-mono text-xs">{pago.mercadoPagoId}</td>
						<td class="p-3 font-medium">${pago.amount.toLocaleString('es-CO')}</td>
						<td class="p-3">{pago.status}</td>
					</tr>
				{:else}
					<tr>
						<td colspan="3" class="p-4 text-center text-gray-500">No hay pagos registrados.</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
