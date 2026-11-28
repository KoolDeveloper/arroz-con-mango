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

<h1 class="mb-6 text-4xl text-accent md:text-5xl">Gestión de Franjas Horarias</h1>

{#if form?.error}
	<div class="alert alert-error mb-6">{form.error}</div>
{/if}

<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
	<!-- Panel Izquierdo: Abrir Disponibilidad -->
	<form method="POST" action="?/abrirFranja" use:enhance class="panel h-fit space-y-4">
		<h2 class="text-2xl text-white">Abrir Disponibilidad</h2>

		<div>
			<label for="date" class="field-label">Fecha</label>
			<input id="date" type="date" name="date" required class="field" />
		</div>

		<div class="grid grid-cols-2 gap-4">
			<div>
				<label for="startTime" class="field-label">Inicio</label>
				<select id="startTime" name="startTime" required class="field">
					<option value="" disabled selected>Hora</option>
					{#each horasCerradas as hora (hora)}
						<option value={hora}>{hora}</option>
					{/each}
				</select>
			</div>
			<div>
				<label for="endTime" class="field-label">Fin</label>
				<select id="endTime" name="endTime" required class="field">
					<option value="" disabled selected>Hora</option>
					{#each horasCerradas as hora (hora)}
						<option value={hora}>{hora}</option>
					{/each}
				</select>
			</div>
		</div>

		<button type="submit" class="btn-primary btn-sm w-full"> Generar Bloques de 1h </button>
	</form>

	<!-- Panel Derecho: Tabla CRUD de Franjas -->
	<div class="panel lg:col-span-2">
		<div class="mb-4 flex flex-wrap items-center justify-between gap-2">
			<h2 class="text-2xl text-white">Franjas Registradas ({franjasFiltradas.length})</h2>
			<div class="flex items-center gap-2">
				<input
					type="date"
					aria-label="Filtrar por fecha"
					bind:value={filtroFecha}
					class="field field-sm w-auto"
				/>
				{#if filtroFecha}
					<button
						type="button"
						onclick={() => (filtroFecha = '')}
						class="text-xs text-white/50 underline"
					>
						Ver todas
					</button>
				{/if}
			</div>
		</div>

		<div class="overflow-x-auto">
			<table class="data-table">
				<thead>
					<tr>
						<th class="p-3">Fecha</th>
						<th class="p-3">Horario</th>
						<th class="p-3">Estado</th>
						<th class="p-3">Acciones</th>
					</tr>
				</thead>
				<tbody>
					{#each franjasFiltradas as f (f.id)}
						<tr>
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
											class="field field-sm w-auto"
										/>
										<input
											type="time"
											name="startTime"
											aria-label="Hora inicio"
											value={f.startTime}
											class="field field-sm w-auto"
										/>
										<input
											type="time"
											name="endTime"
											aria-label="Hora fin"
											value={f.endTime}
											class="field field-sm w-auto"
										/>
										<select
											name="available"
											aria-label="Disponibilidad"
											value={String(f.available)}
											class="field field-sm w-auto"
										>
											<option value="true">Libre</option>
											<option value="false">Ocupada</option>
										</select>
										<button type="submit" class="btn-primary btn-sm"> Guardar </button>
										<button
											type="button"
											onclick={() => (editandoId = null)}
											class="px-2 text-white/50 hover:text-white"
										>
											Cancelar
										</button>
									</form>
								</td>
							{:else}
								<td class="p-3">{f.date}</td>
								<td class="p-3 font-medium">{f.startTime} - {f.endTime}</td>
								<td class="p-3">
									<span class="badge {f.available ? 'badge-ok' : 'badge-error'}">
										{f.available ? 'Libre' : 'Ocupada'}
									</span>
								</td>
								<td class="flex gap-3 p-3">
									<button type="button" onclick={() => (editandoId = f.id)} class="link-action">
										Editar
									</button>
									<form method="POST" action="?/eliminarFranja" use:enhance>
										<input type="hidden" name="id" value={f.id} />
										<button type="submit" class="link-danger">Eliminar</button>
									</form>
								</td>
							{/if}
						</tr>
					{:else}
						<tr>
							<td colspan="4" class="p-4 text-center text-white/50">
								No hay franjas para mostrar.
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
