<script lang="ts">
	import Icon from '@iconify/svelte';
	import ok from '@iconify-icons/arcticons/ok';
	import clear from '@iconify-icons/arcticons/clear';
	import goodwyGallery from '@iconify-icons/arcticons/goodwy-gallery';

	const skills = [
		{
			title: 'Claridad',
			description: 'Ordena lo que piensas, entiende lo que sientes y decide con claridad',
			icon: clear
		},
		{
			title: 'Bienestar Emocional',
			description:
				'Desarrolla herramientas para gestionar el estres, soltar lo que te pesa y recuperar tu paz.',
			icon: ok
		},
		{
			title: 'Proposito',
			description:
				'Reconecta con lo que realmente te importa y construye la vida que quieres vivir.',
			icon: goodwyGallery
		}
	];
</script>

<section class="h-full w-full p-4">
	<div>
		<h2 class="font-title">Conversaciones que abren nuevas posibilidades</h2>
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
			<div class="flex flex-col gap-2 rounded-md p-4">
				<div class="flex items-center gap-2">
					<h3 class="font-title">{skill.title}</h3>
					<Icon icon={skill.icon} class="w-6 h-6" />
				</div>
				<p>{skill.description}</p>
			</div>
		{/each}
	</div>
</section>
