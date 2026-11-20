<script lang="ts">
	import Icon from '@iconify/svelte';
	import instagram from '@iconify-icons/arcticons/instagram';
	import youtube from '@iconify-icons/arcticons/youtube';
	import spotify from '@iconify-icons/arcticons/spotify';

	type Props = {
		class?: string;
	};

	let { class: className = '' }: Props = $props();
</script>

<div class={`${className}`}>
	<a href="https://www.instagram.com/alejoelcoach/" target="_blank" rel="noopener noreferrer">
		<div
			class="inline-flex rounded-md bg-linear-to-tl from-primary via-[#DD2A7B] to-[#515BD4] p-1 font-extrabold text-white shadow-md shadow-[#515BD4] transition duration-100 hover:scale-95 hover:shadow-primary hover:brightness-150"
		>
			<Icon icon={instagram} class="h-20 w-20" />
		</div>
	</a>
	<a href="https://www.youtube.com/@alejopinapena" target="_blank" rel="noopener noreferrer">
		<div
			class="inline-flex rounded-md bg-[#cc181e] p-1 text-white shadow-md shadow-[#DD2A7B] transition duration-100 hover:scale-95 hover:shadow-primary hover:brightness-200"
		>
			<Icon icon={youtube} class="h-20 w-20" />
		</div>
	</a>
	<a
		href="https://open.spotify.com/show/0f733gwYrbEgqvovhYSTpz?si=3MgLrwFuT1yFyVnvEW7BzA&utm_source=native-share-menu"
		target="_blank"
		rel="noopener noreferrer"
	>
		<div
			class="inline-flex rounded-md bg-linear-to-b from-[#1dd75e] to-[#1db954] p-1 text-[#191414] shadow-md shadow-[#d13884] transition duration-100 hover:scale-95 hover:text-white hover:shadow-primary hover:brightness-200"
		>
			<Icon icon={spotify} class="h-20 w-20" />
		</div>
	</a>
</div>
