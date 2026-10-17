<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();
	let metricas = $derived(data.metricas);

	const horasCerradas = Array.from({ length: 24 }, (_, i) => {
		return `${i.toString().padStart(2, '0')}:00`;
	});
</script>

<div class="min-h-screen bg-gray-50 p-8">
	<header class="mb-8 flex items-center justify-between">
		<h1 class="text-3xl font-bold text-gray-800">Dashboard</h1>
		<span class="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
			Zero Trust Activo
		</span>
	</header>

	<!-- Tarjetas de Métricas -->
	<section class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<div class="rounded-lg bg-white p-6 shadow">
			<h3 class="text-sm font-medium text-gray-500">Ingresos Totales</h3>
			<p class="mt-2 text-3xl font-bold text-green-600">
				<!-- Formateamos el número como moneda local -->
				${metricas.ingresosTotales.toLocaleString('es-CO')}
			</p>
		</div>
		<div class="rounded-lg bg-white p-6 shadow">
			<h3 class="text-sm font-medium text-gray-500">Franjas Libres</h3>
			<p class="mt-2 text-3xl font-bold text-primary">{metricas.totalFranjasLibres}</p>
		</div>
		<div class="rounded-lg bg-white p-6 shadow">
			<h3 class="text-sm font-medium text-gray-500">Pacientes</h3>
			<p class="mt-2 text-3xl font-bold text-primary">{metricas.totalPacientes}</p>
		</div>
		<div class="rounded-lg bg-white p-6 shadow">
			<h3 class="text-sm font-medium text-gray-500">Citas Recientes</h3>
			<p class="mt-2 text-3xl font-bold text-primary">{metricas.citasRecientes.length}</p>
		</div>
	</section>

	<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
		<!-- Panel Izquierdo: Acciones Rápidas -->
		<div class="lg:col-span-1">
			<div class="rounded-lg bg-white p-6 shadow">
				<h2 class="mb-4 text-xl font-semibold">Abrir Disponibilidad</h2>

				{#if form?.error}
					<p class="mb-4 text-sm text-red-500">{form.error}</p>
				{/if}
				{#if form?.success}
					<p class="mb-4 text-sm text-green-500">Franja añadida correctamente.</p>
				{/if}

				<form method="POST" action="?/abrirFranja" use:enhance class="space-y-4">
					<div>
						<label for="date" class="block text-sm font-medium text-gray-700">Fecha</label>
						<input type="date" name="date" required class="mt-1 block w-full rounded border p-2" />
					</div>
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label for="startTime" class="block text-sm font-medium text-gray-700">Inicio</label>
							<select
								name="startTime"
								required
								class="mt-1 block w-full rounded border bg-white p-2"
							>
								<option value="" disabled selected>Hora de inicio</option>
								{#each horasCerradas as hora (hora)}
									<option value={hora}>{hora}</option>
								{/each}
							</select>
						</div>
						<div>
							<label for="endTime" class="block text-sm font-medium text-gray-700">Fin</label>
							<select name="endTime" required class="mt-1 block w-full rounded border bg-white p-2">
								<option value="" disabled selected>Hora de fin</option>
								{#each horasCerradas as hora (hora)}
									<option value={hora}>{hora}</option>
								{/each}
							</select>
						</div>
					</div>
					<button
						type="submit"
						class="w-full rounded bg-primary py-2 text-white transition hover:bg-primary/90"
					>
						Añadir Franja
					</button>
				</form>
			</div>
		</div>

		<!-- Panel Derecho: Citas Recientes -->
		<div class="space-y-8 lg:col-span-2">
			<div class="rounded-lg bg-white p-6 shadow">
				<h2 class="mb-4 text-xl font-semibold">Últimas Citas</h2>
				<div class="overflow-x-auto">
					<table class="w-full text-left text-sm">
						<thead class="bg-gray-100 text-gray-600">
							<tr>
								<th class="p-3">ID Paciente</th>
								<th class="p-3">Estado</th>
								<th class="p-3">Pago</th>
								<th class="p-3">Acciones</th>
							</tr>
						</thead>
						<tbody>
							{#each metricas.citasRecientes as cita (cita.id)}
								<tr class="border-b">
									<td class="p-3">{cita.pacienteId}</td>
									<td class="p-3">
										<span
											class="rounded px-2 py-1 text-xs font-semibold
                                            {cita.estadoCita === 'pendiente'
												? 'bg-yellow-100 text-yellow-800'
												: ''}
                                            {cita.estadoCita === 'confirmada'
												? 'bg-green-100 text-green-800'
												: ''}
                                            {cita.estadoCita === 'cancelada'
												? 'bg-red-100 text-red-800'
												: ''}"
										>
											{cita.estadoCita}
										</span>
									</td>
									<td class="p-3">{cita.estadoPago}</td>
									<td class="p-3">
										{#if cita.estadoCita !== 'cancelada'}
											<form method="POST" action="?/cancelarCita" use:enhance>
												<input type="hidden" name="citaId" value={cita.id} />
												<button type="submit" class="text-red-500 hover:underline">
													Cancelar
												</button>
											</form>
										{:else}
											<span class="text-gray-400">Sin acciones</span>
										{/if}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
			<div class="rounded-lg bg-white p-6 shadow">
				<h2 class="mb-4 text-xl font-semibold">Últimas Transacciones</h2>
				<div class="overflow-x-auto">
					<table class="w-full text-left text-sm">
						<thead class="bg-gray-100 text-gray-600">
							<tr>
								<th class="p-3">Ref. Pago (MP)</th>
								<th class="p-3">ID Cita</th>
								<th class="p-3">Monto</th>
								<th class="p-3">Estado</th>
							</tr>
						</thead>
						<tbody>
							{#each metricas.pagosRecientes as pago (pago.mercado_pago_id)}
								<tr class="border-b hover:bg-gray-50">
									<td class="p-3 font-mono text-xs text-gray-500">
										{pago.mercado_pago_id}
									</td>
									<td class="p-3 text-gray-600">
										{pago.cita_id.substring(0, 8)}...
									</td>
									<td class="p-3 font-medium">
										${pago.amount.toLocaleString('es-CO')}
									</td>
									<td class="p-3">
										<span
											class="rounded px-2 py-1 text-xs font-semibold
                                            {pago.status === 'aprobado' ||
											pago.status === 'approved'
												? 'bg-green-100 text-green-800'
												: ''}
                                            {pago.status === 'pendiente' ||
											pago.status === 'pending'
												? 'bg-yellow-100 text-yellow-800'
												: ''}
                                            {pago.status === 'rechazado' ||
											pago.status === 'rejected'
												? 'bg-red-100 text-red-800'
												: ''}"
										>
											{pago.status}
										</span>
									</td>
								</tr>
							{:else}
								<tr>
									<td colspan="4" class="p-4 text-center text-gray-500">
										No hay pagos registrados aún.
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>
</div>
