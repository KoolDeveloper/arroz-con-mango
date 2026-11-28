<script lang="ts">
	import { formatearPrecio } from '$lib/formato';
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';

	let { data, form } = $props();
</script>

<div class="mb-6 flex items-center justify-between">
	<h1 class="text-4xl text-accent md:text-5xl">Talleres</h1>
	<a href={resolve('/dashboard/talleres/[id]', { id: 'nuevo' })} class="btn-primary btn-sm">
		+ Nuevo taller
	</a>
</div>

{#if form?.error}
	<div class="alert alert-error mb-6">{form.error}</div>
{/if}

<div class="panel overflow-x-auto">
	<table class="data-table">
		<thead>
			<tr>
				<th class="p-3">Nombre</th>
				<th class="p-3">Precio (COP)</th>
				<th class="p-3">Estado</th>
				<th class="p-3">Compradores</th>
				<th class="p-3">Acciones</th>
			</tr>
		</thead>
		<tbody>
			{#each data.talleres as t (t.id)}
				<tr>
					<td class="p-3 font-medium">
						<a
							href={resolve('/dashboard/talleres/[id]', { id: t.id })}
							class="hover:text-primary hover:underline">{t.nombre}</a
						>
					</td>
					<td class="p-3">{formatearPrecio(t.precio)}</td>
					<td class="p-3">
						<form method="POST" action="?/alternarPublicado" use:enhance>
							<input type="hidden" name="id" value={t.id} />
							<input type="hidden" name="publicado" value={String(!t.publicado)} />
							<button
								class="badge {t.publicado ? 'badge-ok' : 'badge-muted'}"
								title="Cambiar estado"
							>
								{t.publicado ? 'Publicado' : 'Borrador'}
							</button>
						</form>
					</td>
					<td class="p-3">{t.compradores}</td>
					<td class="flex gap-3 p-3">
						<a href={resolve('/dashboard/talleres/[id]', { id: t.id })} class="link-action"
							>Editar</a
						>
						<a
							href={resolve('/aplicacion/talleres/[id]', { id: t.id })}
							target="_blank"
							class="text-white/60 hover:text-white hover:underline">Ver</a
						>
						<form
							method="POST"
							action="?/eliminar"
							use:enhance={({ cancel }) => {
								if (!confirm(`¿Eliminar "${t.nombre}"? Quienes lo compraron perderán el acceso.`))
									cancel();
							}}
						>
							<input type="hidden" name="id" value={t.id} />
							<button class="link-danger">Eliminar</button>
						</form>
					</td>
				</tr>
			{:else}
				<tr>
					<td colspan="5" class="p-4 text-center text-white/50">Aún no hay talleres.</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
