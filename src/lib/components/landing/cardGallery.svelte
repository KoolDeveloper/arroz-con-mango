<script lang="ts">
	import Icon from '@iconify/svelte';
	import ok from '@iconify-icons/arcticons/ok';
	import clear from '@iconify-icons/arcticons/clear';
	import goodwyGallery from '@iconify-icons/arcticons/goodwy-gallery';
	import type { Action } from 'svelte/action';

	const skills = [
		{
			title: 'Claridad',
			description: 'Ordena lo que piensas, entiende lo que sientes y decide con claridad',
			icon: clear,
			color: 'text-[#38BDF8]',
			border: 'border-[#0284C7]'
		},
		{
			title: 'Bienestar Emocional',
			description:
				'Desarrolla herramientas para gestionar el estres, soltar lo que te pesa y recuperar tu paz.',
			icon: ok,
			color: 'text-[#10B981]',
			border: 'border-[#5ef97b]'
		},
		{
			title: 'Propósito',
			description:
				'Reconecta con lo que realmente te importa y construye la vida que quieres vivir.',
			icon: goodwyGallery,
			color: 'text-[#f30313]',
			border: 'border-[#a10684]'
		}
	];

	let visibleItems = $state<Record<number, boolean>>({});

	const inView: Action<HTMLElement, number> = (node, index) => {
		const observer = new IntersectionObserver(
			([entry]) => {
				visibleItems[index] = entry.isIntersecting;
			},
			{ threshold: 0.1 }
		);

		observer.observe(node);

		return {
			destroy() {
				observer.disconnect();
			}
		};
	};
</script>

<div class="h-full w-full">
	<div class="grid max-h-[62vh] gap-4 overflow-y-scroll px-6 md:grid-flow-col">
		{#each skills as skill, index (skill.title)}
			<div
				use:inView={index}
				class={`grid h-64 w-full justify-items-center gap-2 border-2 ${skill.border} p-4 transition-colors hover:bg-[#a1f1c0]/10 md:min-w-72`}
			>
				<Icon
					icon={skill.icon}
					class={`h-10 w-10 self-center ${skill.color} ${visibleItems[index] ? (index === 1 ? '' : 'animate-spin [animation-duration:8s]') : ''}`}
				/>
				<h3 class="text-center text-3xl">{skill.title}</h3>
				<p class="text-justify">{skill.description}</p>
			</div>
		{/each}
	</div>
</div>
