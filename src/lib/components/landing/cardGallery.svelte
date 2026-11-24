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
			title: 'Propósito',
			description:
				'Reconecta con lo que realmente te importa y construye la vida que quieres vivir.',
			icon: goodwyGallery
		}
	];
</script>

<div class="h-full w-full text-2xl">
	<div class="grid max-h-[62vh] gap-4 overflow-y-scroll px-6 md:grid-flow-col">
		{#each skills as skill (skill.title)}
			<div
				class="grid h-full w-full justify-items-center gap-2 border-2 border-primary/50 p-4 transition-colors hover:bg-accent/10 md:min-w-72"
			>
				<Icon
					icon={skill.icon}
					class={`h-10 w-10 self-center ${skill.title !== 'Bienestar Emocional' ? 'animate-spin [animation-duration:8s]' : ''}`}
				/>
				<h3 class="text-center font-title font-bold">{skill.title}</h3>
				<p class="text-justify">{skill.description}</p>
			</div>
		{/each}
	</div>
</div>
