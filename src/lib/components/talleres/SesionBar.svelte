<script lang="ts">
	import { enlaceAuth } from '$lib/auth-links';
	import type { UsuarioSesion } from '$lib/server/auth';

	const { usuario, redirectTo }: { usuario: UsuarioSesion | null; redirectTo: string } = $props();
</script>

<div class="flex flex-wrap items-center justify-end gap-3 text-sm text-white/70">
	{#if usuario}
		<span class="hidden sm:inline">Hola, <strong class="text-white">{usuario.nombre}</strong></span>
		<form method="POST" action="/auth/logout">
			<button class="btn-secondary btn-sm">Salir</button>
		</form>
	{:else}
		<a class="btn-primary btn-sm" href={enlaceAuth('/auth/login', redirectTo)}>Entrar</a>
	{/if}
</div>
