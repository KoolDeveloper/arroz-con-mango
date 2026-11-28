<script lang="ts">
	import { formatearPrecio } from '$lib/formato';
	import { enhance } from '$app/forms';
	import type { PagoSelect } from '$lib/server/db/schema';

	let { data, form } = $props();

	let pagoEditando = $state<PagoSelect | null>(null);
</script>

<h1 class="mb-6 text-4xl text-accent md:text-5xl">Gestión de Pagos y Finanzas</h1>

{#if form?.error}
	<div class="alert alert-error mb-6">{form.error}</div>
{/if}

<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
	<!-- Formulario Crear / Editar Pago -->
	<form
		method="POST"
		action="?/guardarPago"
		use:enhance={() => {
			return async ({ update }) => {
				await update();
				pagoEditando = null;
			};
		}}
		class="panel h-fit space-y-4"
	>
		<h2 class="text-2xl text-white">
			{pagoEditando ? 'Editar Transacción' : 'Registrar Pago Manual'}
		</h2>
		<input type="hidden" name="id" value={pagoEditando?.id ?? ''} />

		<div>
			<label for="citaId" class="field-label">Cita Asociada</label>
			<select id="citaId" name="citaId" required value={pagoEditando?.citaId ?? ''} class="field">
				<option value="" disabled>Selecciona una cita...</option>
				{#each data.citas as c (c.id)}
					<option value={c.id}>Cita {c.id.substring(0, 8)} ({c.estadoCita})</option>
				{/each}
			</select>
		</div>

		<div>
			<label for="mercadoPagoId" class="field-label"> Referencia (MP o Transferencia) </label>
			<input
				id="mercadoPagoId"
				type="text"
				name="mercadoPagoId"
				placeholder="Ej. MP-123456"
				value={pagoEditando?.mercadoPagoId ?? ''}
				class="field"
			/>
		</div>

		<div class="grid grid-cols-2 gap-3">
			<div>
				<label for="amount" class="field-label">Monto (COP)</label>
				<input
					id="amount"
					type="number"
					name="amount"
					min="1"
					required
					value={pagoEditando?.amount ?? ''}
					class="field"
				/>
			</div>
			<div>
				<label for="status" class="field-label">Estado</label>
				<select id="status" name="status" value={pagoEditando?.status ?? 'aprobado'} class="field">
					<option value="aprobado">Aprobado</option>
					<option value="pendiente">Pendiente</option>
					<option value="rechazado">Rechazado</option>
				</select>
			</div>
		</div>

		<div class="flex gap-2">
			<button type="submit" class="btn-primary btn-sm flex-1">
				{pagoEditando ? 'Actualizar Pago' : 'Registrar Pago'}
			</button>
			{#if pagoEditando}
				<button type="button" onclick={() => (pagoEditando = null)} class="btn-secondary btn-sm">
					Cancelar
				</button>
			{/if}
		</div>
	</form>

	<!-- Tabla de Pagos -->
	<div class="panel lg:col-span-2">
		<h2 class="mb-4 text-2xl text-white">Transacciones Registradas</h2>
		<div class="overflow-x-auto">
			<table class="data-table">
				<thead>
					<tr>
						<th class="p-3">Referencia</th>
						<th class="p-3">Cita ID</th>
						<th class="p-3">Monto</th>
						<th class="p-3">Estado</th>
						<th class="p-3">Acciones</th>
					</tr>
				</thead>
				<tbody>
					{#each data.pagos as p (p.id)}
						<tr>
							<td class="p-3 font-mono text-xs">{p.mercadoPagoId}</td>
							<td class="p-3 font-mono text-xs"
								>{p.citaId
									? `${p.citaId.substring(0, 8)}...`
									: p.compraTallerId
										? 'Taller'
										: '—'}</td
							>
							<td class="p-3 font-semibold">{formatearPrecio(p.amount)}</td>
							<td class="p-3">
								<span
									class="badge
									{p.status === 'aprobado' || p.status === 'approved' ? 'badge-ok' : ''}
									{p.status === 'pendiente' || p.status === 'pending' ? 'badge-warn' : ''}
									{p.status === 'rechazado' || p.status === 'rejected' ? 'badge-error' : ''}"
								>
									{p.status}
								</span>
							</td>
							<td class="flex gap-3 p-3">
								<button type="button" onclick={() => (pagoEditando = p)} class="link-action">
									Editar
								</button>
								<form method="POST" action="?/eliminarPago" use:enhance>
									<input type="hidden" name="id" value={p.id} />
									<button type="submit" class="link-danger">Eliminar</button>
								</form>
							</td>
						</tr>
					{:else}
						<tr>
							<td colspan="5" class="p-4 text-center text-white/50">
								No hay transacciones registradas.
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
