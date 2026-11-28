<script lang="ts">
	import { resolve } from '$app/paths';
	import Icon from '@iconify/svelte';
	import whatsapp from '@iconify-icons/arcticons/whatsapp';
	import type { Snippet } from 'svelte';
	import PageShell from './PageShell.svelte';

	const { children }: { children: Snippet } = $props();
</script>

<PageShell centrado ancho="max-w-xl">
	<div class="glass-card text-center">
		<div class="grid gap-3">
			{@render children()}
		</div>

		<div class="panel mt-8">
			<h2 class="text-2xl">¿Tienes alguna pregunta?</h2>
			<p class="mt-1 text-sm text-white/60">Escríbeme si tienes dudas sobre tu cita o el pago.</p>
			<a
				href="https://wa.me/573028023341"
				target="_blank"
				rel="noopener noreferrer"
				class="btn-secondary btn-sm mt-4 border-green-500/60 text-green-300 hover:border-green-400 hover:text-green-200"
			>
				<Icon icon={whatsapp} width="20" height="20" /> WhatsApp
			</a>
		</div>

		<a class="btn-primary mt-6" href={resolve('/')}>Volver al inicio</a>
	</div>
</PageShell>
