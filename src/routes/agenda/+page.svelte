<script lang="ts">

    type Franja = {
        id: number;
        startTime: string;
        endTime: string;
        available: boolean;
    }

    const franjas: Franja[] = [];

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
        <div>

        </div>
    </section>
</main>