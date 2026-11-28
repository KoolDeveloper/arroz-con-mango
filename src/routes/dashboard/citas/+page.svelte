<script lang="ts">
	import { formatearPrecio } from '$lib/formato';
	import { enhance } from '$app/forms';
	import type { TipoCitaSelect } from '$lib/server/db/schema';

	let { data, form } = $props();

	let servicioEditando = $state<TipoCitaSelect | null>(null);
	let citaEditandoId = $state<string | null>(null);
</script>

<h1 class="mb-6 text-4xl text-accent md:text-5xl">Gestión de Citas y Catálogo</h1>

{#if form?.error}
	<div class="alert alert-error mb-6">{form.error}</div>
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
		class="panel space-y-4"
	>
		<h2 class="text-2xl text-white">
			{servicioEditando ? 'Editar Servicio' : 'Crear Tipo de Cita'}
		</h2>
		<input type="hidden" name="id" value={servicioEditando?.id ?? ''} />

		<div>
			<label for="nombre" class="field-label">Nombre</label>
			<input
				id="nombre"
				type="text"
				name="nombre"
				required
				value={servicioEditando?.nombre ?? ''}
				class="field"
			/>
		</div>

		<div class="grid grid-cols-2 gap-3">
			<div>
				<label for="duracionFranjas" class="field-label"> Duración (Horas) </label>
				<input
					id="duracionFranjas"
					type="number"
					name="duracionFranjas"
					min="1"
					required
					value={servicioEditando?.duracionFranjas ?? 1}
					class="field"
				/>
			</div>
			<div>
				<label for="precio" class="field-label">Precio (COP)</label>
				<input
					id="precio"
					type="number"
					name="precio"
					min="0"
					step="1000"
					required
					value={servicioEditando?.precio ?? ''}
					class="field"
				/>
			</div>
		</div>

		<div>
			<label for="descripcion" class="field-label">Descripción</label>
			<input
				id="descripcion"
				type="text"
				name="descripcion"
				value={servicioEditando?.descripcion ?? ''}
				class="field"
			/>
		</div>

		<div class="flex gap-2">
			<button type="submit" class="btn-primary btn-sm flex-1">
				{servicioEditando ? 'Actualizar' : 'Crear Servicio'}
			</button>
			{#if servicioEditando}
				<button
					type="button"
					onclick={() => (servicioEditando = null)}
					class="btn-secondary btn-sm"
				>
					Cancelar
				</button>
			{/if}
		</div>
	</form>

	<div class="panel lg:col-span-2">
		<h2 class="mb-4 text-2xl text-white">Catálogo de Servicios</h2>
		<div class="overflow-x-auto">
			<table class="data-table">
				<thead>
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
						<tr>
							<td class="p-3">
								<p class="font-medium">{s.nombre}</p>
								{#if s.descripcion}
									<p class="text-xs text-white/50">{s.descripcion}</p>
								{/if}
							</td>
							<td class="p-3">{s.duracionFranjas}h</td>
							<td class="p-3 font-semibold">{formatearPrecio(s.precio)}</td>
							<td class="p-3">
								<span class="badge {s.activo ? 'badge-ok' : 'badge-muted'}">
									{s.activo ? 'Activo' : 'Oculto'}
								</span>
							</td>
							<td class="flex gap-3 p-3">
								<button type="button" onclick={() => (servicioEditando = s)} class="link-action">
									Editar
								</button>
								<form method="POST" action="?/toggleServicio" use:enhance>
									<input type="hidden" name="id" value={s.id} />
									<input type="hidden" name="activo" value={String(s.activo)} />
									<button type="submit" class="link-action">
										{s.activo ? 'Ocultar' : 'Activar'}
									</button>
								</form>
								<form method="POST" action="?/eliminarServicio" use:enhance>
									<input type="hidden" name="id" value={s.id} />
									<button type="submit" class="link-danger">Eliminar</button>
								</form>
							</td>
						</tr>
					{:else}
						<tr>
							<td colspan="5" class="p-4 text-center text-white/50">
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
<div class="panel">
	<h2 class="mb-4 text-2xl text-white">Historial de Citas</h2>
	<div class="overflow-x-auto">
		<table class="data-table">
			<thead>
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
					<tr>
						<td class="p-3">
							<p class="font-medium">{c.pacienteNombre ?? c.pacienteId.substring(0, 8)}</p>
							{#if c.pacienteEmail}
								<p class="text-xs text-white/50">{c.pacienteEmail}</p>
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
										class="field field-sm w-auto"
									>
										<option value="pendiente">Pendiente</option>
										<option value="confirmada">Confirmada</option>
										<option value="cancelada">Cancelada</option>
									</select>
									<select
										name="estadoPago"
										aria-label="Estado del pago"
										value={c.estadoPago}
										class="field field-sm w-auto"
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
										class="field field-sm w-auto"
									/>
									<button type="submit" class="btn-primary btn-sm"> Guardar </button>
									<button
										type="button"
										onclick={() => (citaEditandoId = null)}
										class="px-2 text-white/50 hover:text-white"
									>
										Cancelar
									</button>
								</form>
							</td>
						{:else}
							<td class="p-3">
								<span
									class="badge
									{c.estadoCita === 'pendiente' ? 'badge-warn' : ''}
									{c.estadoCita === 'confirmada' ? 'badge-ok' : ''}
									{c.estadoCita === 'cancelada' ? 'badge-error' : ''}"
								>
									{c.estadoCita}
								</span>
							</td>
							<td class="p-3">{c.estadoPago}</td>
							<td class="p-3 text-white/50">{c.notasCliente ?? '-'}</td>
							<td class="flex gap-3 p-3">
								<button type="button" onclick={() => (citaEditandoId = c.id)} class="link-action">
									Editar
								</button>
								<form method="POST" action="?/eliminarCita" use:enhance>
									<input type="hidden" name="id" value={c.id} />
									<button type="submit" class="link-danger">Borrar</button>
								</form>
							</td>
						{/if}
					</tr>
				{:else}
					<tr>
						<td colspan="6" class="p-4 text-center text-white/50">No hay citas registradas.</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
