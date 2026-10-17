<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PagoSelect } from '$lib/server/db/schema';

	let { data, form } = $props();

	let pagoEditando = $state<PagoSelect | null>(null);
</script>

<h1 class="mb-6 text-3xl font-bold text-gray-800">Gestión de Pagos y Finanzas</h1>

{#if form?.error}
	<div class="mb-6 rounded bg-red-100 p-4 text-sm text-red-700">{form.error}</div>
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
		class="h-fit space-y-4 rounded-lg bg-white p-6 shadow"
	>
		<h2 class="text-xl font-semibold">
			{pagoEditando ? 'Editar Transacción' : 'Registrar Pago Manual'}
		</h2>
		<input type="hidden" name="id" value={pagoEditando?.id ?? ''} />

		<div>
			<label for="citaId" class="block text-sm font-medium text-gray-700">Cita Asociada</label>
			<select
				id="citaId"
				name="citaId"
				required
				value={pagoEditando?.citaId ?? ''}
				class="mt-1 w-full rounded border bg-white p-2 text-sm"
			>
				<option value="" disabled>Selecciona una cita...</option>
				{#each data.citas as c (c.id)}
					<option value={c.id}>Cita {c.id.substring(0, 8)} ({c.estadoCita})</option>
				{/each}
			</select>
		</div>

		<div>
			<label for="mercadoPagoId" class="block text-sm font-medium text-gray-700">
				Referencia (MP o Transferencia)
			</label>
			<input
				id="mercadoPagoId"
				type="text"
				name="mercadoPagoId"
				placeholder="Ej. MP-123456"
				value={pagoEditando?.mercadoPagoId ?? ''}
				class="mt-1 w-full rounded border p-2"
			/>
		</div>

		<div class="grid grid-cols-2 gap-3">
			<div>
				<label for="amount" class="block text-sm font-medium text-gray-700">Monto (COP)</label>
				<input
					id="amount"
					type="number"
					name="amount"
					min="1"
					required
					value={pagoEditando?.amount ?? ''}
					class="mt-1 w-full rounded border p-2"
				/>
			</div>
			<div>
				<label for="status" class="block text-sm font-medium text-gray-700">Estado</label>
				<select
					id="status"
					name="status"
					value={pagoEditando?.status ?? 'aprobado'}
					class="mt-1 w-full rounded border bg-white p-2"
				>
					<option value="aprobado">Aprobado</option>
					<option value="pendiente">Pendiente</option>
					<option value="rechazado">Rechazado</option>
				</select>
			</div>
		</div>

		<div class="flex gap-2">
			<button type="submit" class="flex-1 rounded bg-primary py-2 font-medium text-white">
				{pagoEditando ? 'Actualizar Pago' : 'Registrar Pago'}
			</button>
			{#if pagoEditando}
				<button
					type="button"
					onclick={() => (pagoEditando = null)}
					class="rounded bg-gray-200 px-3 text-sm"
				>
					Cancelar
				</button>
			{/if}
		</div>
	</form>

	<!-- Tabla de Pagos -->
	<div class="rounded-lg bg-white p-6 shadow lg:col-span-2">
		<h2 class="mb-4 text-xl font-semibold">Transacciones Registradas</h2>
		<div class="overflow-x-auto">
			<table class="w-full text-left text-sm">
				<thead class="bg-gray-100 text-gray-600">
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
						<tr class="border-b">
							<td class="p-3 font-mono text-xs">{p.mercadoPagoId}</td>
							<td class="p-3 font-mono text-xs">{p.citaId.substring(0, 8)}...</td>
							<td class="p-3 font-semibold">${p.amount.toLocaleString('es-CO')}</td>
							<td class="p-3">
								<span
									class="rounded px-2 py-1 text-xs font-semibold
									{p.status === 'aprobado' || p.status === 'approved' ? 'bg-green-100 text-green-800' : ''}
									{p.status === 'pendiente' || p.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
									{p.status === 'rechazado' || p.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}"
								>
									{p.status}
								</span>
							</td>
							<td class="flex gap-3 p-3">
								<button
									type="button"
									onclick={() => (pagoEditando = p)}
									class="text-blue-600 hover:underline"
								>
									Editar
								</button>
								<form method="POST" action="?/eliminarPago" use:enhance>
									<input type="hidden" name="id" value={p.id} />
									<button type="submit" class="text-red-600 hover:underline">Eliminar</button>
								</form>
							</td>
						</tr>
					{:else}
						<tr>
							<td colspan="5" class="p-4 text-center text-gray-500">
								No hay transacciones registradas.
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>