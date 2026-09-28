<script lang="ts">
	type Franja = {
		id: number;
		startTime: string;
		endTime: string;
		available: boolean;
	};

	const franjas: Franja[] = [
		{ id: 1, startTime: '09:00', endTime: '10:00', available: true },
		{ id: 2, startTime: '10:00', endTime: '11:00', available: false },
		{ id: 3, startTime: '11:00', endTime: '12:00', available: true },
		{ id: 4, startTime: '12:00', endTime: '13:00', available: true },
		{ id: 5, startTime: '13:00', endTime: '14:00', available: false }
	];
</script>

<main
	class="mx-auto mt-8 w-1/2 max-w-5xl rounded-lg border-4 border-gray-300 bg-white p-6 text-center shadow-lg"
>
	<h1 class="mb-4 text-3xl font-bold">Agenda</h1>
	<p class="mb-4">Selecciona que tipo de cita:</p>
	<select>
		<option value="coaching">Coaching</option>
		<option value="mentoria">Mentoría Grupal</option>
	</select>
	<p class="mb-4">Selecciona una franja horaria disponible para reservar:</p>
	<section class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
		{#each franjas as franja (franja.id)}
			<button
				class="w-full rounded-lg border-2 p-4 text-center transition-colors duration-300"
				class:available={franja.available}
				class:unavailable={!franja.available}
				disabled={!franja.available}
			>
				{franja.startTime} - {franja.endTime}
			</button>
		{/each}
	</section>
</main>
