<script lang="ts">
	import { enlaceAuth } from '$lib/auth-links';
	import Icon from '@iconify/svelte';

	const { redirectTo }: { redirectTo: string } = $props();
</script>

<a href={enlaceAuth('/auth/google', redirectTo)} data-sveltekit-reload class="btn-secondary w-full">
	<Icon icon="logos:google-icon" width="18" height="18" />
	Continuar con Google
</a>
<div class="my-5 flex items-center gap-3 text-xs tracking-widest text-white/40 uppercase">
	<span class="h-px flex-1 bg-white/10"></span>o<span class="h-px flex-1 bg-white/10"></span>
</div>
