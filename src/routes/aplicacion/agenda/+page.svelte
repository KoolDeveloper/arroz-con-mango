<script lang="ts">
	import { enhance } from '$app/forms';
	let { data, form } = $props();

	// Estado local inicializado limpio (evita la advertencia de Svelte 5)
	let tipoCitaId = $state<string>('');
	let fechaSeleccionada = $state<string>('');
	let bloqueSeleccionado = $state<{
		ids: string[];
		startTime: string;
		endTime: string;
	} | null>(null);
	let enviando = $state<boolean>(false);

	// Sincronización reactiva del tipo de cita por defecto
	$effect(() => {
		if (!tipoCitaId && data.tiposCita.length > 0) {
			tipoCitaId = data.tiposCita[0].id;
		}
	});

	const servicioActual = $derived(
		data.tiposCita.find((t) => t.id === tipoCitaId) ?? data.tiposCita[0]
	);

	// 1. Días con disponibilidad real
	const fechasDisponibles = $derived.by(() => {
		const fechas = data.franjas.filter((f) => f.available).map((f) => f.date);
		return [...new Set(fechas)].sort();
	});

	// 2. Franjas del día seleccionado
	const franjasDelDia = $derived.by(() => {
		if (!fechaSeleccionada) return [];
		return data.franjas.filter((f) => f.date === fechaSeleccionada);
	});

	// 3. Bloques consecutivos según la duración del servicio
	const franjasDisponibles = $derived.by(() => {
		const franjas = franjasDelDia;
		const horasNecesarias = servicioActual?.duracionFranjas ?? 1;

		if (horasNecesarias === 1) {
			return franjas
				.filter((f) => f.available)
				.map((f) => ({
					ids: [f.id],
					startTime: f.startTime,
					endTime: f.endTime
				}));
		}

		const resultado = [];
		for (let i = 0; i <= franjas.length - horasNecesarias; i++) {
			const grupo = franjas.slice(i, i + horasNecesarias);

			const consecutivas = grupo.every((actual, idx: number) => {
				if (!actual.available) return false;
				if (idx === grupo.length - 1) return true;
				return actual.endTime === grupo[idx + 1].startTime;
			});

			if (consecutivas) {
				resultado.push({
					ids: grupo.map((g) => g.id),
					startTime: grupo[0].startTime,
					endTime: grupo.at(-1)!.endTime
				});
			}
		}
		return resultado;
	});
</script>

<main
	class="mx-auto my-8 w-[90vw] max-w-3xl rounded-lg border-4 border-primary/40 bg-white p-6 text-center shadow-lg"
>
	<h1 class="mb-4 text-3xl font-bold">Agenda tu Sesión</h1>

	{#if form?.error}
		<div class="mb-6 rounded-lg bg-red-100 p-4 text-sm text-red-700">
			{form.error}
		</div>
	{/if}

	{#if data.tiposCita.length === 0}
		<p class="text-gray-500">No hay servicios configurados en este momento.</p>
	{:else if fechasDisponibles.length === 0}
		<p class="text-red-500">No hay disponibilidad de horarios en este momento.</p>
	{:else}
		<!-- PASO 1: TIPO DE CITA -->
		<div class="mb-6 text-left">
			<label for="tipoCita" class="mb-2 block font-semibold">1. Selecciona el tipo de cita:</label>
			<select
				id="tipoCita"
				bind:value={tipoCitaId}
				onchange={() => (bloqueSeleccionado = null)}
				class="w-full rounded border bg-white p-2.5"
			>
				{#each data.tiposCita as tipo (tipo.id)}
					<option value={tipo.id}>
						{tipo.nombre} ({tipo.duracionFranjas}h) — ${tipo.precio.toLocaleString('es-CO')}
					</option>
				{/each}
			</select>
			{#if servicioActual?.descripcion}
				<p class="mt-1 text-xs text-gray-500">{servicioActual.descripcion}</p>
			{/if}
		</div>

		<!-- PASO 2: FECHA -->
		<div class="mb-6 text-left">
			<label for="fecha" class="mb-2 block font-semibold">2. Selecciona un día disponible:</label>
			<select
				id="fecha"
				bind:value={fechaSeleccionada}
				onchange={() => (bloqueSeleccionado = null)}
				class="w-full rounded border bg-white p-2.5"
			>
				<option value="" disabled selected>Elige una fecha...</option>
				{#each fechasDisponibles as fecha (fecha)}
					<option value={fecha}>{fecha}</option>
				{/each}
			</select>
		</div>

		<!-- PASO 3: HORARIOS -->
		{#if fechaSeleccionada}
			<div class="mb-6 text-left">
				<p class="mb-3 font-semibold">3. Horarios disponibles para el {fechaSeleccionada}:</p>
				<section class="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
					{#if franjasDisponibles.length === 0}
						<p class="col-span-full text-center text-primary">
							No hay bloques consecutivos suficientes ({servicioActual?.duracionFranjas}h) para este
							servicio en esta fecha.
						</p>
					{:else}
						{#each franjasDisponibles as bloque (bloque.ids.join('-'))}
							{@const seleccionado = bloqueSeleccionado?.ids.join('-') === bloque.ids.join('-')}
							<button
								type="button"
								onclick={() => (bloqueSeleccionado = bloque)}
								class="w-full rounded-lg border-2 p-3 text-center font-medium transition-colors
								{seleccionado
									? 'border-primary bg-primary text-white'
									: 'border-gray-300 hover:border-primary hover:bg-primary/10'}"
							>
								{bloque.startTime} - {bloque.endTime}
							</button>
						{/each}
					{/if}
				</section>
			</div>

			<!-- PASO 4: FORMULARIO DE DATOS Y PAGO -->
			{#if bloqueSeleccionado && servicioActual}
				<form
					method="POST"
					action="?/reservar"
					use:enhance={() => {
						enviando = true;
						return async ({ update }) => {
							await update();
							enviando = false;
						};
					}}
					class="mt-8 rounded-lg border-2 border-primary/30 bg-gray-50 p-6 text-left shadow-inner"
				>
					<h2 class="mb-4 text-center text-xl font-bold text-gray-800">
						4. Tus datos para confirmar y pagar
					</h2>

					<input type="hidden" name="franjasIds" value={JSON.stringify(bloqueSeleccionado.ids)} />
					<input type="hidden" name="tipoCitaId" value={servicioActual.id} />

					<div class="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div class="col-span-2">
							<label for="nombre" class="block text-sm font-medium text-gray-700"
								>Nombre completo *</label
							>
							<input
								id="nombre"
								type="text"
								name="nombre"
								title="Ingresa tu nombre completo"
								placeholder="Ej. Juan Pérez"
								required
								class="mt-1 w-full rounded border bg-white p-2"
							/>
						</div>
						<div class="flex-col self-center content-center gap-2 col-span-2 md:col-span-1">
							<label for="indicativo" class="block text-sm font-medium text-gray-700"
								>Indicativo</label
							>
							<select
								aria-label="Indicativo de país"
								title="Selecciona el indicativo de tu país"
								name="indicativo" 
								class="w-28 rounded border bg-white p-2 text-sm"
							>
								<option value="+57">🇨🇴 +57</option>
								<option value="+1">🇺🇸 +1</option>
								<option value="+34">🇪🇸 +34</option>
								<option value="+51">🇵🇪 +51</option>
								<option value="+52">🇲🇽 +52</option>
								<option value="+54">🇦🇷 +54</option>
								<option value="+56">🇨🇱 +56</option>
								<option value="+593">🇪🇨 +593</option>
							</select>
						</div>
						<div>
							<label for="telefono" class="block text-sm font-medium text-gray-700"
								>Teléfono / WhatsApp *</label
							>
							<input
								id="telefono"
								type="tel"
								name="telefono"
								required
								minlength="7"
								maxlength="15"
								title="Ingresa un número de teléfono válido (mínimo 7 dígitos)"
								placeholder="Ej. 3001234567"
								class="mt-1 w-full rounded border bg-white p-2"
							/>
						</div>
					</div>

					<div class="mb-4">
						<label for="email" class="block text-sm font-medium text-gray-700"
							>Correo electrónico *</label
						>
						<input
							id="email"
							type="email"
							name="email"
							title="Ingresa un correo electrónico válido"
							placeholder="Ej. joseelmago@dominio.com"
							required
							class="mt-1 w-full rounded border bg-white p-2"
						/>
					</div>

					<div class="mb-6">
						<label for="notasCliente" class="block text-sm font-medium text-gray-700"
							>Notas o comentarios (opcional)</label
						>
						<textarea
							id="notasCliente"
							name="notasCliente"
							title="Hay algo que debamos saber antes de tu cita?"
							rows="2"
							class="mt-1 w-full rounded border bg-white p-2"></textarea>
					</div>

					<button
						type="submit"
						disabled={enviando}
						class="w-full rounded-lg bg-primary py-3 font-bold text-white transition hover:bg-primary/90 disabled:opacity-50"
					>
						{enviando
							? 'Redirigiendo a Mercado Pago...'
							: `Pagar $${servicioActual.precio.toLocaleString('es-CO')} y Agendar`}
					</button>
				</form>
			{/if}
		{/if}
	{/if}
</main>
