<script lang="ts">
	type Props = { message: string; tone?: 'error' | 'ok' | 'warn' };
	let { message, tone = 'error' }: Props = $props();
</script>

<div role={tone === 'error' ? 'alert' : 'status'} class="alert alert-{tone} mb-6">
	{message}
</div>
