<script lang="ts">
	type Props = {
		class? : string;
	};

	let {class: className = '',} : Props = $props();

</script>

<footer class={`z-10 mt-10 flex w-screen justify-between px-4 text-[10px] ${className}`}>
	<a
		href="https://github.com/KoolDeveloper"
		target="_blank"
		rel="noopener noreferrer"
		class="self-end text-[#555]"
	>
		Desarrollado con 🧡 por Kooldeveloper.
	</a>
</footer>
