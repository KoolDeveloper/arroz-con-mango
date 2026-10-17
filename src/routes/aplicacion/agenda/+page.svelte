<script lang="ts">
	import { enhance } from '$app/forms';

	let { data } = $props();

	// Estado local
	let tipoCita = $state<string>('mentoria');
	let fechaSeleccionada = $state<string>('');

	const DURACION: Record<string, number> = {
		mentoria: 1,
		mentoriaG: 2 // Asumiendo que 1 unidad = 1 franja (ej. 30 min)
	};

	// 1. FILTRO DE FECHAS: Extraer solo los días que tienen al menos una franja libre
	const fechasDisponibles = $derived.by(() => {
		const fechas = data.franjas.filter((f) => f.available).map((f) => f.date);

		// Retornar un array de fechas únicas y ordenadas
		return [...new Set(fechas)].sort();
	});

	// 2. Filtrar las franjas correspondientes al día seleccionado
	const franjasDelDia = $derived.by(() => {
		if (!fechaSeleccionada) return [];
		return data.franjas.filter((f) => f.date === fechaSeleccionada);
	});

	// 3. Lógica de agrupación corregida para guardar múltiples IDs
	const franjasDisponibles = $derived.by(() => {
		const franjas = franjasDelDia;
		const horasNecesarias = DURACION[tipoCita];

		if (horasNecesarias === 1) {
			return franjas
				.filter((f) => f.available)
				.map((f) => ({
					ids: [f.id], // Lo estandarizamos como array
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
					ids: grupo.map((g) => g.id), // ¡Capturamos todos los IDs del bloque!
					startTime: grupo[0].startTime,
					endTime: grupo.at(-1)!.endTime
				});
			}
		}
		return resultado;
	});
</script>

<main
	class="mx-auto mt-8 w-[90vw] max-w-5xl rounded-lg border-4 border-primary/40 bg-white p-6 text-center shadow-lg md:w-1/2"
>
	<h1 class="mb-4 text-3xl font-bold">Agenda</h1>

	<p class="mb-4 font-semibold">1. Selecciona un día disponible:</p>

	<!-- Selector dinámico: Solo muestra días con disponibilidad real -->
	{#if fechasDisponibles.length === 0}
		<p class="text-red-500">No hay disponibilidad en este momento.</p>
	{:else}
		<select bind:value={fechaSeleccionada} class="mb-6 w-full max-w-xs rounded border p-2">
			<option value="" disabled>Elige una fecha...</option>
			{#each fechasDisponibles as fecha (fecha)}
				<option value={fecha}>{fecha}</option>
			{/each}
		</select>
	{/if}

	{#if fechaSeleccionada}
		<p class="mb-4 font-semibold">2. Selecciona el tipo de cita:</p>
		<select bind:value={tipoCita} class="mb-6 w-full max-w-xs rounded border p-2">
			<option value="mentoria">Mentoría 1 a 1</option>
			<option value="mentoriaG">Mentoría Grupal</option>
		</select>

		<p class="mb-4 font-semibold">3. Horarios para el {fechaSeleccionada}:</p>
		<section class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
			{#if franjasDisponibles.length === 0}
				<p class="col-span-full text-center text-primary">
					No hay bloques de tiempo suficientes para este tipo de cita.
				</p>
			{:else}
				{#each franjasDisponibles as bloque (bloque.ids.join('-'))}
					<!-- Formulario integrado para interactuar con tu +page.server.ts -->
					<form method="POST" action="?/reservar" use:enhance>
						<!-- Convertimos el array de IDs a string JSON para mandarlo en el formData -->
						<input type="hidden" name="franjasIds" value={JSON.stringify(bloque.ids)} />
						<input type="hidden" name="tipoCita" value={tipoCita} />

						<button
							type="submit"
							class="w-full rounded-lg border-2 border-gray-300 p-4 text-center transition-colors duration-300 hover:border-primary hover:bg-primary/10"
						>
							{bloque.startTime} - {bloque.endTime}
						</button>
					</form>
				{/each}
			{/if}
		</section>
	{/if}
</main>
