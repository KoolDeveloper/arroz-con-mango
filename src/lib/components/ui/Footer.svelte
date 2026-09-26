<script lang="ts">
	import Icon from '@iconify/svelte';

	import instagram from '@iconify-icons/arcticons/instagram';
	import youtube from '@iconify-icons/arcticons/youtube';
</script>

<footer
	class="col-span-32 col-start-1 row-span-1 row-start-18 flex items-center justify-between px-4 pb-2 font-cursive text-sm"
>
	<p>Desarrollado por Kooldeveloper.</p>
	<div class="flex gap-4">
		<a href="https://www.instagram.com/alejoelcoach/" target="_blank" rel="noopener noreferrer">
			<div
				class="inline-flex rounded-full bg-linear-to-tl from-primary via-[#DD2A7B] to-[#515BD4] p-1 font-extrabold text-white hover:brightness-150"
			>
				<Icon icon={instagram} class="h-6 w-6" />
			</div>
		</a>
		<a href="https://www.youtube.com/@alejopinapena" target="_blank" rel="noopener noreferrer">
			<div class="inline-flex rounded-full bg-red-600 p-1 text-white hover:brightness-200">
				<Icon icon={youtube} class="h-6 w-6" />
			</div>
		</a>
	</div>
</footer>
