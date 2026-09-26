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
	<div class="mt-6 grid gap-4 p-4 md:grid-cols-3">
		{#each skills as skill (skill.title)}
			<div
				class="flex flex-col gap-2 rounded-md border-2 border-primary/50 p-4 transition-colors hover:bg-accent/10"
			>
				<div class="flex items-center justify-center gap-2">
					<h3 class="text-center font-title">{skill.title}</h3>
					<Icon icon={skill.icon} class="h-6 w-6" />
				</div>
				<p>{skill.description}</p>
			</div>
		{/each}
	</div>
</section>
