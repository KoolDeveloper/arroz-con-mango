<script lang="ts">
	import Icon from '@iconify/svelte';
	import instagram from '@iconify-icons/arcticons/instagram';
	import youtube from '@iconify-icons/arcticons/youtube';

	type Props = {
		class?: string;
	};

	let { class: className = '' }: Props = $props();
</script>

<div class={`flex gap-4 ${className}`}>
	<a href="https://www.instagram.com/alejoelcoach/" target="_blank" rel="noopener noreferrer">
		<div
			class="inline-flex rounded-full bg-linear-to-tl from-primary via-[#DD2A7B] to-[#515BD4] p-1 font-extrabold text-white hover:brightness-150"
		>
			<Icon icon={instagram} class="h-6 w-6" />
		</div>
	</a>
	<a href="https://www.youtube.com/@alejopinapena" target="_blank" rel="noopener noreferrer">
		<div class="inline-flex rounded-full bg-[#cc181e] p-1 text-white hover:brightness-200">
			<Icon icon={youtube} class="h-6 w-6" />
		</div>
	</a>
</div>
