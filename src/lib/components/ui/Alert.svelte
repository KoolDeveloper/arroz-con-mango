<script lang="ts">
	let { message }: { message: string } = $props();
</script>

<div
	role="alert"
	class="mb-6 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
>
	{message}
</div>
