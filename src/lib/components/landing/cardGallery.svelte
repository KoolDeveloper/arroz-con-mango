<script lang="ts">
	import { UserPlus, Sprout, Goal } from '@lucide/svelte';

	const skills = [
		{
			title: 'Claridad',
			description: 'Ordena lo que piensas, entiende lo que sientes y decide con claridad',
			icon: UserPlus
		},
		{
			title: 'Bienestar Emocional',
			description:
				'Desarrolla herramientas para gestionar el estres, soltar lo que te pesa y recuperar tu paz.',
			icon: Sprout
		},
		{
			title: 'Proposito',
			description:
				'Reconecta con lo que realmente te importa y construye la vida que quieres vivir.',
			icon: Goal
		}
	];
</script>

<section class="h-full w-full">
	<div>
		<h2>Conversaciones que abren nuevas posibilidades</h2>
		<p>
			A veces no necesitas mas fuerza de voluntad, necesitas una conversacion que te permita ver lo
			que hoy no estas viendo
		</p>
	</div>
	<div>
		<p>
			acompañamiento de coaching para que te conozcas, te entiendas y tomes decisiones alineadas con
			tu bienestar y tu proposito
		</p>
	</div>
	<div class="grid grid-cols-2 gap-4 p-4">
		{#each skills as skill (skill.title)}
			<div class="flex flex-col gap-2 rounded-md border-2 border-primary p-4 hover:bg-primary/10 hover:border-primary/50">
				<div class="flex items-center gap-2">
					<h3>{skill.title}</h3>
					<skill.icon />
				</div>
				<p>{skill.description}</p>
			</div>
		{/each}
	</div>
</section>
