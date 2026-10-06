<script lang="ts">
	import type { TipoCita } from '$lib/types/agenda';

	let { data } = $props();

	let tipoCita = $state<TipoCita>('coaching');

	let fechaSeleccionada = $state<string>('');

	const DURACION = {
		coaching: 1,
		mentoria: 2
	};

	const franjasDelDia = $derived.by(() => {
		if (!fechaSeleccionada) return [];

		return data.franjas.filter((f) => f.date === fechaSeleccionada);
	});

	const franjasDisponibles = $derived.by(() => {
		const franjas = franjasDelDia;

		const horasNecesarias = DURACION[tipoCita];

		if (horasNecesarias === 1) {
			return franjas.filter((f) => f.available);
		}

		const resultado = [];

		for (let i = 0; i <= franjas.length - horasNecesarias; i++) {
			const grupo = franjas.slice(i, i + horasNecesarias);

			const consecutivas = grupo.every((actual, idx) => {
				if (!actual.available) return false;
				if (idx === grupo.length - 1) return true;

				return actual.endTime === grupo[idx + 1].startTime;
			});

			if (consecutivas) {
				resultado.push({
					id: grupo[0].id,
					startTime: grupo[0].startTime,
					endTime: grupo.at(-1)!.endTime
				});
			}
		}
		return resultado;
	});
</script>

<main
	class="mx-auto mt-8 w-1/2 max-w-5xl rounded-lg border-4 border-primary/40 bg-white p-6 text-center shadow-lg"
>
	<h1 class="mb-4 text-3xl font-bold">Agenda</h1>
	<p class="mb-4">Selecciona una fecha:</p>
	<input type="date" bind:value={fechaSeleccionada} class="mb-4 rounded border p-2" />
	{#if fechaSeleccionada}
		<p class="mb-4">Selecciona que tipo de cita:</p>
		<select bind:value={tipoCita}>
			<option value="coaching">Coaching</option>
			<option value="mentoria">Mentoría Grupal</option>
		</select>
		<p class="mb-4">Selecciona una franja horaria disponible para reservar:</p>
		<section class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
			{#if franjasDisponibles.length === 0}
				<p class="col-span-full text-center text-red-500">
					No hay horarios disponibles para este tipo de cita.
				</p>
			{:else}
				{#each franjasDisponibles as franja (franja.id)}
					<button class="w-full rounded-lg border-2 p-4 text-center transition-colors duration-300">
						{franja.startTime} - {franja.endTime}
					</button>
				{/each}
			{/if}
		</section>
	{/if}
</main>
