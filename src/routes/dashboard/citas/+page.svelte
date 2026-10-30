<script lang="ts">
	import { enhance } from '$app/forms';
	import type { TipoCitaSelect } from '$lib/server/db/schema';

	let { data, form } = $props();

	let servicioEditando = $state<TipoCitaSelect | null>(null);
	let citaEditandoId = $state<string | null>(null);
</script>

<h1 class="mb-6 text-3xl font-bold text-gray-800">Gestión de Citas y Catálogo</h1>

{#if form?.error}
	<div class="mb-6 rounded bg-red-100 p-4 text-sm text-red-700">{form.error}</div>
{/if}

<!-- SECCIÓN 1: CRUD DE TIPOS DE CITA -->
<div class="mb-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
	<form
		method="POST"
		action="?/guardarServicio"
		use:enhance={() => {
			return async ({ update }) => {
				await update();
				servicioEditando = null;
			};
		}}
		class="space-y-4 rounded-lg bg-white p-6 shadow"
	>
		<h2 class="text-xl font-semibold">
			{servicioEditando ? 'Editar Servicio' : 'Crear Tipo de Cita'}
		</h2>
		<input type="hidden" name="id" value={servicioEditando?.id ?? ''} />

		<div>
			<label for="nombre" class="block text-sm font-medium text-gray-700">Nombre</label>
			<input
				id="nombre"
				type="text"
				name="nombre"
				required
				value={servicioEditando?.nombre ?? ''}
				class="mt-1 w-full rounded border p-2"
			/>
		</div>

		<div class="grid grid-cols-2 gap-3">
			<div>
				<label for="duracionFranjas" class="block text-sm font-medium text-gray-700">
					Duración (Horas)
				</label>
				<input
					id="duracionFranjas"
					type="number"
					name="duracionFranjas"
					min="1"
					required
					value={servicioEditando?.duracionFranjas ?? 1}
					class="mt-1 w-full rounded border p-2"
				/>
			</div>
			<div>
				<label for="precio" class="block text-sm font-medium text-gray-700">Precio (COP)</label>
				<input
					id="precio"
					type="number"
					name="precio"
					min="0"
					step="1000"
					required
					value={servicioEditando?.precio ?? ''}
					class="mt-1 w-full rounded border p-2"
				/>
			</div>
		</div>

		<div>
			<label for="descripcion" class="block text-sm font-medium text-gray-700">Descripción</label>
			<input
				id="descripcion"
				type="text"
				name="descripcion"
				value={servicioEditando?.descripcion ?? ''}
				class="mt-1 w-full rounded border p-2"
			/>
		</div>

		<div class="flex gap-2">
			<button type="submit" class="flex-1 rounded bg-primary py-2 font-medium text-white">
				{servicioEditando ? 'Actualizar' : 'Crear Servicio'}
			</button>
			{#if servicioEditando}
				<button
					type="button"
					onclick={() => (servicioEditando = null)}
					class="rounded bg-gray-200 px-3 text-sm"
				>
					Cancelar
				</button>
			{/if}
		</div>
	</form>

	<div class="rounded-lg bg-white p-6 shadow lg:col-span-2">
		<h2 class="mb-4 text-xl font-semibold">Catálogo de Servicios</h2>
		<div class="overflow-x-auto">
			<table class="w-full text-left text-sm">
				<thead class="bg-gray-100 text-gray-600">
					<tr>
						<th class="p-3">Servicio</th>
						<th class="p-3">Duración</th>
						<th class="p-3">Precio</th>
						<th class="p-3">Estado</th>
						<th class="p-3">Acciones</th>
					</tr>
				</thead>
				<tbody>
					{#each data.servicios as s (s.id)}
						<tr class="border-b">
							<td class="p-3">
								<p class="font-medium">{s.nombre}</p>
								{#if s.descripcion}
									<p class="text-xs text-gray-500">{s.descripcion}</p>
								{/if}
							</td>
							<td class="p-3">{s.duracionFranjas}h</td>
							<td class="p-3 font-semibold">${s.precio.toLocaleString('es-CO')}</td>
							<td class="p-3">
								<span
									class="rounded px-2 py-1 text-xs font-semibold {s.activo
										? 'bg-green-100 text-green-800'
										: 'bg-gray-200 text-gray-700'}"
								>
									{s.activo ? 'Activo' : 'Oculto'}
								</span>
							</td>
							<td class="flex gap-3 p-3">
								<button
									type="button"
									onclick={() => (servicioEditando = s)}
									class="text-blue-600 hover:underline"
								>
									Editar
								</button>
								<form method="POST" action="?/toggleServicio" use:enhance>
									<input type="hidden" name="id" value={s.id} />
									<input type="hidden" name="activo" value={String(s.activo)} />
									<button type="submit" class="text-amber-600 hover:underline">
										{s.activo ? 'Ocultar' : 'Activar'}
									</button>
								</form>
								<form method="POST" action="?/eliminarServicio" use:enhance>
									<input type="hidden" name="id" value={s.id} />
									<button type="submit" class="text-red-600 hover:underline">Eliminar</button>
								</form>
							</td>
						</tr>
					{:else}
						<tr>
							<td colspan="5" class="p-4 text-center text-gray-500">
								No hay tipos de cita registrados.
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>

<!-- SECCIÓN 2: CRUD DE CITAS AGENDADAS -->
<div class="rounded-lg bg-white p-6 shadow">
	<h2 class="mb-4 text-xl font-semibold">Historial de Citas</h2>
	<div class="overflow-x-auto">
		<table class="w-full text-left text-sm">
			<thead class="bg-gray-100 text-gray-600">
				<tr>
					<th class="p-3">Cliente</th>
					<th class="p-3">Servicio</th>
					<th class="p-3">Estado Cita</th>
					<th class="p-3">Estado Pago</th>
					<th class="p-3">Notas</th>
					<th class="p-3">Acciones</th>
				</tr>
			</thead>
			<tbody>
				{#each data.citas as c (c.id)}
					<tr class="border-b">
						<td class="p-3">
							<p class="font-medium">{c.pacienteNombre ?? c.pacienteId.substring(0, 8)}</p>
							{#if c.pacienteEmail}
								<p class="text-xs text-gray-500">{c.pacienteEmail}</p>
							{/if}
						</td>
						<td class="p-3">{c.tipoNombre ?? c.tipoCitaId}</td>

						{#if citaEditandoId === c.id}
							<td colspan="4" class="p-3">
								<form
									method="POST"
									action="?/actualizarCita"
									use:enhance={() => {
										return async ({ update }) => {
											await update();
											citaEditandoId = null;
										};
									}}
									class="flex flex-wrap items-center gap-2"
								>
									<input type="hidden" name="id" value={c.id} />
									<select
										name="estadoCita"
										aria-label="Estado de la cita"
										value={c.estadoCita}
										class="rounded border bg-white p-1.5"
									>
										<option value="pendiente">Pendiente</option>
										<option value="confirmada">Confirmada</option>
										<option value="cancelada">Cancelada</option>
									</select>
									<select
										name="estadoPago"
										aria-label="Estado del pago"
										value={c.estadoPago}
										class="rounded border bg-white p-1.5"
									>
										<option value="pendiente">Pago Pendiente</option>
										<option value="aprobado">Pago Aprobado</option>
										<option value="rechazado">Pago Rechazado</option>
									</select>
									<input
										type="text"
										name="notasCliente"
										aria-label="Notas del cliente"
										value={c.notasCliente ?? ''}
										placeholder="Notas..."
										class="rounded border p-1.5"
									/>
									<button type="submit" class="rounded bg-green-600 px-3 py-1.5 text-white">
										Guardar
									</button>
									<button
										type="button"
										onclick={() => (citaEditandoId = null)}
										class="px-2 text-gray-500"
									>
										Cancelar
									</button>
								</form>
							</td>
						{:else}
							<td class="p-3">
								<span
									class="rounded px-2 py-1 text-xs font-semibold
									{c.estadoCita === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : ''}
									{c.estadoCita === 'confirmada' ? 'bg-green-100 text-green-800' : ''}
									{c.estadoCita === 'cancelada' ? 'bg-red-100 text-red-800' : ''}"
								>
									{c.estadoCita}
								</span>
							</td>
							<td class="p-3">{c.estadoPago}</td>
							<td class="p-3 text-gray-500">{c.notasCliente ?? '-'}</td>
							<td class="flex gap-3 p-3">
								<button
									type="button"
									onclick={() => (citaEditandoId = c.id)}
									class="text-blue-600 hover:underline"
								>
									Editar
								</button>
								<form method="POST" action="?/eliminarCita" use:enhance>
									<input type="hidden" name="id" value={c.id} />
									<button type="submit" class="text-red-600 hover:underline">Borrar</button>
								</form>
							</td>
						{/if}
					</tr>
				{:else}
					<tr>
						<td colspan="6" class="p-4 text-center text-gray-500">No hay citas registradas.</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>