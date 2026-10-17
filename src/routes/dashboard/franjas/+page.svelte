<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	let editandoId = $state<string | null>(null);
	let filtroFecha = $state<string>('');

	const horasCerradas = Array.from({ length: 24 }, (_, i) => {
		return `${i.toString().padStart(2, '0')}:00`;
	});

	const franjasFiltradas = $derived(
		filtroFecha ? data.franjas.filter((f) => f.date === filtroFecha) : data.franjas
	);
</script>

<h1 class="mb-6 text-3xl font-bold text-gray-800">Gestión de Franjas Horarias</h1>

{#if form?.error}
	<div class="mb-6 rounded bg-red-100 p-4 text-sm text-red-700">{form.error}</div>
{/if}

<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
	<!-- Panel Izquierdo: Abrir Disponibilidad -->
	<form
		method="POST"
		action="?/abrirFranja"
		use:enhance
		class="h-fit space-y-4 rounded-lg bg-white p-6 shadow"
	>
		<h2 class="text-xl font-semibold">Abrir Disponibilidad</h2>

		<div>
			<label for="date" class="block text-sm font-medium text-gray-700">Fecha</label>
			<input
				id="date"
				type="date"
				name="date"
				required
				class="mt-1 block w-full rounded border p-2"
			/>
		</div>

		<div class="grid grid-cols-2 gap-4">
			<div>
				<label for="startTime" class="block text-sm font-medium text-gray-700">Inicio</label>
				<select
					id="startTime"
					name="startTime"
					required
					class="mt-1 block w-full rounded border bg-white p-2"
				>
					<option value="" disabled selected>Hora</option>
					{#each horasCerradas as hora (hora)}
						<option value={hora}>{hora}</option>
					{/each}
				</select>
			</div>
			<div>
				<label for="endTime" class="block text-sm font-medium text-gray-700">Fin</label>
				<select
					id="endTime"
					name="endTime"
					required
					class="mt-1 block w-full rounded border bg-white p-2"
				>
					<option value="" disabled selected>Hora</option>
					{#each horasCerradas as hora (hora)}
						<option value={hora}>{hora}</option>
					{/each}
				</select>
			</div>
		</div>

		<button
			type="submit"
			class="w-full rounded bg-primary py-2 font-medium text-white transition hover:bg-primary/90"
		>
			Generar Bloques de 1h
		</button>
	</form>

	<!-- Panel Derecho: Tabla CRUD de Franjas -->
	<div class="rounded-lg bg-white p-6 shadow lg:col-span-2">
		<div class="mb-4 flex flex-wrap items-center justify-between gap-2">
			<h2 class="text-xl font-semibold">Franjas Registradas ({franjasFiltradas.length})</h2>
			<div class="flex items-center gap-2">
				<input
					type="date"
					aria-label="Filtrar por fecha"
					bind:value={filtroFecha}
					class="rounded border p-1.5 text-sm"
				/>
				{#if filtroFecha}
					<button
						type="button"
						onclick={() => (filtroFecha = '')}
						class="text-xs text-gray-500 underline"
					>
						Ver todas
					</button>
				{/if}
			</div>
		</div>

		<div class="overflow-x-auto">
			<table class="w-full text-left text-sm">
				<thead class="bg-gray-100 text-gray-600">
					<tr>
						<th class="p-3">Fecha</th>
						<th class="p-3">Horario</th>
						<th class="p-3">Estado</th>
						<th class="p-3">Acciones</th>
					</tr>
				</thead>
				<tbody>
					{#each franjasFiltradas as f (f.id)}
						<tr class="border-b">
							{#if editandoId === f.id}
								<td colspan="4" class="p-3">
									<form
										method="POST"
										action="?/editarFranja"
										use:enhance={() => {
											return async ({ update }) => {
												await update();
												editandoId = null;
											};
										}}
										class="flex flex-wrap items-center gap-2"
									>
										<input type="hidden" name="id" value={f.id} />
										<input
											type="date"
											name="date"
											aria-label="Fecha"
											value={f.date}
											class="rounded border p-1.5"
										/>
										<input
											type="time"
											name="startTime"
											aria-label="Hora inicio"
											value={f.startTime}
											class="rounded border p-1.5"
										/>
										<input
											type="time"
											name="endTime"
											aria-label="Hora fin"
											value={f.endTime}
											class="rounded border p-1.5"
										/>
										<select
											name="available"
											aria-label="Disponibilidad"
											value={String(f.available)}
											class="rounded border bg-white p-1.5"
										>
											<option value="true">Libre</option>
											<option value="false">Ocupada</option>
										</select>
										<button type="submit" class="rounded bg-green-600 px-3 py-1.5 text-white">
											Guardar
										</button>
										<button
											type="button"
											onclick={() => (editandoId = null)}
											class="px-2 text-gray-500"
										>
											Cancelar
										</button>
									</form>
								</td>
							{:else}
								<td class="p-3">{f.date}</td>
								<td class="p-3 font-medium">{f.startTime} - {f.endTime}</td>
								<td class="p-3">
									<span
										class="rounded px-2 py-1 text-xs font-semibold {f.available
											? 'bg-green-100 text-green-800'
											: 'bg-red-100 text-red-800'}"
									>
										{f.available ? 'Libre' : 'Ocupada'}
									</span>
								</td>
								<td class="flex gap-3 p-3">
									<button
										type="button"
										onclick={() => (editandoId = f.id)}
										class="text-blue-600 hover:underline"
									>
										Editar
									</button>
									<form method="POST" action="?/eliminarFranja" use:enhance>
										<input type="hidden" name="id" value={f.id} />
										<button type="submit" class="text-red-600 hover:underline">Eliminar</button>
									</form>
								</td>
							{/if}
						</tr>
					{:else}
						<tr>
							<td colspan="4" class="p-4 text-center text-gray-500">
								No hay franjas para mostrar.
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>