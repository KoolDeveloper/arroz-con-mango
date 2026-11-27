<script lang="ts">
	const INDICATIVOS = [
		['+57', '🇨🇴'],
		['+1', '🇺🇸'],
		['+34', '🇪🇸'],
		['+51', '🇵🇪'],
		['+52', '🇲🇽'],
		['+54', '🇦🇷'],
		['+56', '🇨🇱'],
		['+593', '🇪🇨']
	] as const;

	let { indicativo = $bindable('+57') }: { indicativo?: string } = $props();
</script>

<div class="grid grid-cols-1 gap-4 sm:grid-cols-[auto_1fr]">
	<div class="sm:col-span-2">
		<label for="nombre" class="field-label">Nombre completo *</label>
		<input
			id="nombre"
			type="text"
			name="nombre"
			autocomplete="name"
			placeholder="Ej. Juan Pérez"
			required
			class="field"
		/>
	</div>
	<div>
		<label for="indicativo" class="field-label">País</label>
		<select id="indicativo" name="indicativo" bind:value={indicativo} class="field sm:w-32">
			{#each INDICATIVOS as [codigo, bandera] (codigo)}
				<option value={codigo}>{bandera} {codigo}</option>
			{/each}
		</select>
	</div>
	<div>
		<label for="telefono" class="field-label">Teléfono / WhatsApp *</label>
		<input
			id="telefono"
			type="tel"
			name="telefono"
			autocomplete="tel-national"
			required
			minlength="7"
			maxlength="15"
			placeholder="Ej. 3001234567"
			class="field"
		/>
	</div>
	<div class="sm:col-span-2">
		<label for="email" class="field-label">Correo electrónico *</label>
		<input
			id="email"
			type="email"
			name="email"
			autocomplete="email"
			placeholder="tu@correo.com"
			required
			class="field"
		/>
	</div>
	<div class="sm:col-span-2">
		<label for="notasCliente" class="field-label">Notas o comentarios (opcional)</label>
		<textarea
			id="notasCliente"
			name="notasCliente"
			placeholder="¿Hay algo que deba saber antes de la sesión?"
			rows="2"
			class="field resize-none"></textarea>
	</div>
</div>
