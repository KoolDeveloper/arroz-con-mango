<script lang="ts">
	import { resolve } from '$app/paths';
	import Icon from '@iconify/svelte';
	import whatsapp from '@iconify-icons/arcticons/whatsapp';
	import type { Snippet } from 'svelte';

	const { children }: { children: Snippet } = $props();
</script>

<div class="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-12">
	<div
		class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,172,31,0.15),transparent_60%)]"
	></div>

	<div class="glass-card relative w-full max-w-xl text-center text-white">
		<img src="/logotipo.png" alt="Logo" class="mx-auto -mt-4 mb-2 h-20 w-20 object-cover" />

		<div class="grid gap-3">
			{@render children()}
		</div>

		<div class="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
			<h2 class="text-2xl">¿Tienes alguna pregunta?</h2>
			<p class="mt-1 text-sm text-white/60">Escríbeme si tienes dudas sobre tu cita o el pago.</p>
			<a
				href="https://wa.me/573028023341"
				target="_blank"
				rel="noopener noreferrer"
				class="mt-4 inline-flex items-center gap-2 rounded-full bg-green-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-600"
			>
				<Icon icon={whatsapp} width="22" height="22" /> WhatsApp
			</a>
		</div>

		<a
			class="mt-6 inline-block rounded-full bg-accent px-8 py-3 text-sm font-semibold tracking-wider text-black uppercase transition hover:-translate-y-0.5 hover:bg-white"
			href={resolve('/')}
		>
			Volver al inicio
		</a>
	</div>
</div>
