<script lang="ts">
	import { formatearFechaHora } from '$lib/formato';
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import MarkdownEditor from '$lib/components/dashboard/MarkdownEditor.svelte';

	let { data, form } = $props();

	// Estado editable inicializado una vez desde el servidor (no se re-sincroniza al guardar)
	// svelte-ignore state_referenced_locally
	let contenido = $state(data.taller?.contenido ?? '');
	let sinGuardar = $state(false);
	let guardando = $state(false);

	const guardadoOk = $derived(form?.guardado || page.url.searchParams.has('guardado'));
</script>

<svelte:window
	onbeforeunload={(e) => {
		if (sinGuardar) e.preventDefault();
	}}
/>

<div class="mb-6 flex items-center justify-between">
	<div>
		<a href={resolve('/dashboard/talleres')} class="text-sm text-white/60 hover:text-accent"
			>← Talleres</a
		>
		<h1 class="text-4xl text-accent md:text-5xl">
			{data.taller ? 'Editar taller' : 'Nuevo taller'}
		</h1>
	</div>
	{#if data.taller}
		<a
			href={resolve('/aplicacion/talleres/[id]', { id: data.taller.id })}
			target="_blank"
			class="link-action text-sm"
		>
			Ver página pública ↗
		</a>
	{/if}
</div>

{#if form?.error}
	<div class="alert alert-error mb-6">{form.error}</div>
{:else if guardadoOk && !sinGuardar}
	<div class="alert alert-ok mb-6">Cambios guardados.</div>
{/if}

<form
	method="POST"
	action="?/guardar"
	class="space-y-6"
	oninput={() => (sinGuardar = true)}
	use:enhance={() => {
		guardando = true;
		return async ({ update, result }) => {
			if (result.type === 'success' || result.type === 'redirect') sinGuardar = false;
			await update({ reset: false });
			guardando = false;
		};
	}}
>
	<div class="panel grid gap-4 md:grid-cols-3">
		<div class="md:col-span-2">
			<label for="nombre" class="field-label">Nombre</label>
			<input id="nombre" name="nombre" required value={data.taller?.nombre ?? ''} class="field" />
		</div>
		<div>
			<label for="precio" class="field-label">Precio (COP)</label>
			<input
				id="precio"
				name="precio"
				type="number"
				min="1"
				step="1"
				required
				value={data.taller?.precio ?? ''}
				class="field"
			/>
		</div>
		<div class="md:col-span-3">
			<label for="descripcion" class="field-label">
				Descripción <span class="font-normal text-white/40"
					>(pública: la ve quien aún no lo ha comprado)</span
				>
			</label>
			<textarea id="descripcion" name="descripcion" rows="3" class="field"
				>{data.taller?.descripcion ?? ''}</textarea
			>
		</div>
		<label class="flex items-center gap-2 text-sm text-white/80 md:col-span-3">
			<input type="checkbox" name="publicado" checked={data.taller?.publicado ?? false} />
			Publicado (visible en el catálogo y disponible para comprar)
		</label>
	</div>

	<div>
		<p class="mb-2 text-sm font-medium text-white/80">
			Contenido <span class="font-normal text-white/40"
				>(privado: solo lo ven quienes lo compraron)</span
			>
		</p>
		<MarkdownEditor name="contenido" bind:value={contenido} oninput={() => (sinGuardar = true)} />
	</div>

	<div class="flex items-center gap-3">
		<button type="submit" disabled={guardando} class="btn-primary">
			{guardando ? 'Guardando…' : data.taller ? 'Guardar cambios' : 'Crear taller'}
		</button>
		{#if sinGuardar}<span class="text-sm text-accent">Hay cambios sin guardar</span>{/if}
	</div>
</form>

{#if data.taller}
	<section class="panel mt-10">
		<h2 class="mb-4 text-2xl text-white">Accesos</h2>

		{#if form?.errorAcceso}
			<div class="alert alert-error mb-4">{form.errorAcceso}</div>
		{:else if form?.accesoOk}
			<div class="alert alert-ok mb-4">{form.accesoOk}</div>
		{/if}

		<form method="POST" action="?/darAcceso" use:enhance class="mb-6 flex flex-wrap gap-2">
			<input
				type="email"
				name="email"
				required
				placeholder="correo@ejemplo.com"
				class="field min-w-64 flex-1"
			/>
			<button class="btn-secondary btn-sm">Dar acceso manual</button>
		</form>

		<div class="overflow-x-auto">
			<table class="data-table">
				<thead>
					<tr>
						<th class="p-3">Usuario</th>
						<th class="p-3">Estado</th>
						<th class="p-3">Creado</th>
						<th class="p-3">Aprobado</th>
						<th class="p-3"></th>
					</tr>
				</thead>
				<tbody>
					{#each data.accesos as a (a.usuarioId)}
						<tr>
							<td class="p-3">
								<p class="font-medium">{a.nombre}</p>
								<p class="text-xs text-white/50">{a.email}</p>
							</td>
							<td class="p-3">
								<span
									class="badge
									{a.estado === 'aprobado' ? 'badge-ok' : ''}
									{a.estado === 'pendiente' ? 'badge-warn' : ''}
									{a.estado === 'rechazado' ? 'badge-error' : ''}"
								>
									{a.estado}
								</span>
							</td>
							<td class="p-3 text-xs">{formatearFechaHora(a.creadoEn)}</td>
							<td class="p-3 text-xs">{formatearFechaHora(a.aprobadoEn)}</td>
							<td class="p-3">
								{#if a.estado === 'aprobado'}
									<form
										method="POST"
										action="?/quitarAcceso"
										use:enhance={({ cancel }) => {
											if (!confirm(`¿Quitar el acceso a ${a.email}?`)) cancel();
										}}
									>
										<input type="hidden" name="usuarioId" value={a.usuarioId} />
										<button class="link-danger">Quitar acceso</button>
									</form>
								{/if}
							</td>
						</tr>
					{:else}
						<tr
							><td colspan="5" class="p-4 text-center text-white/50"
								>Nadie ha comprado este taller aún.</td
							></tr
						>
					{/each}
				</tbody>
			</table>
		</div>
	</section>
{/if}
