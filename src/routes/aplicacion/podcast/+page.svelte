<script>
	import Icon from '@iconify/svelte';
	import Spotify from '@iconify-icons/arcticons/spotify-alt-1';
	import Youtube from '@iconify-icons/arcticons/youtube';
</script>

<main
	class="mx-auto my-8 w-[90vw] max-w-3xl rounded-lg border-4 border-primary/40 bg-white p-6 text-center shadow-lg"
>
	<div class="flex justify-center">
		<img src="/Arroz.png" alt="Logo" height="90" width="180" />
	</div>
	<h2>Sigueme en:</h2>
	<div class="mt-10 flex w-full flex-col items-center gap-8 px-8 md:flex-row md:justify-evenly">
		<div>
			<a
				href="https://open.spotify.com/show/0f733gwYrbEgqvovhYSTpz?si=3MgLrwFuT1yFyVnvEW7BzA&utm_source=native-share-menu"
				target="_blank"
				rel="noopener noreferrer"><Icon icon={Spotify} class="h-16 w-16 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-white" /></a
			>
            <p>Spotify</p>
		</div>
		<div>
			<a href="https://www.youtube.com/@alejopinapena" target="_blank" rel="noopener noreferrer" class="">
				<Icon icon={Youtube} class="h-16 w-16 bg-[#cc181e] rounded-full p-2 text-white hover:bg-[#ef1f1f]" />
			</a>
            <p>Youtube</p>
		</div>
	</div>
</main>
