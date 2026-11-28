<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { enlaceAuth } from '$lib/auth-links';
	import { sugerirMetodo, type MetodoPago } from '$lib/agenda/payment';
	import { formatearPrecio } from '$lib/formato';
	import PaymentMethodPicker from '$lib/components/agenda/PaymentMethodPicker.svelte';
	import SesionBar from '$lib/components/talleres/SesionBar.svelte';
	import PageShell from '$lib/components/ui/PageShell.svelte';
	import SectionHeader from '$lib/components/ui/SectionHeader.svelte';
	import Alert from '$lib/components/ui/Alert.svelte';

	let { data, form } = $props();

	let metodo = $state<MetodoPago>(sugerirMetodo('+57', false));
	let enviando = $state(false);
	const ruta = $derived(`/aplicacion/talleres/${data.taller.id}`);

	const aviso = $derived.by(() => {
		const r = data.resultadoCompra;
		if (!r) return null;
		if (r === 'approved' && data.comprado)
			return { tone: 'ok', texto: '¡Pago aprobado! Ya tienes acceso al taller.' } as const;
		if (r === 'approved' || r === 'pending')
			return {
				tone: 'warn',
				texto:
					'Tu pago está en proceso. Tendrás acceso en cuanto se confirme; vuelve en unos minutos.'
			} as const;
		return { tone: 'error', texto: 'El pago no se completó. Puedes intentarlo de nuevo.' } as const;
	});
</script>

<svelte:head><title>{data.taller.nombre} · Talleres · Alejo Mentor</title></svelte:head>

<PageShell>
	{#snippet acciones()}
		<SesionBar usuario={data.usuario} redirectTo={ruta} />
	{/snippet}

	<a href={resolve('/aplicacion/talleres')} class="text-sm text-white/60 hover:text-accent">
		← Todos los talleres
	</a>

	<div class="mt-6">
		<SectionHeader kicker="Taller" titulo={data.taller.nombre} alinear="left" />
	</div>

	{#if aviso}
		<div class="mt-6"><Alert tone={aviso.tone} message={aviso.texto} /></div>
	{/if}

	{#if data.comprado && data.contenidoHtml !== null}
		<article class="prose prose-lg mt-8 max-w-none prose-invert select-text prose-a:text-accent">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -- HTML generado por renderMarkdown (HTML crudo escapado, URLs filtradas) -->
			{@html data.contenidoHtml}
		</article>
	{:else}
		<p class="mt-4 text-lg whitespace-pre-line text-white/70">{data.taller.descripcion}</p>

		<div class="glass-card mt-10">
			<p class="kicker">Acceso completo</p>
			<p class="mt-1 font-title text-5xl text-accent">{formatearPrecio(data.taller.precio)}</p>

			{#if form?.error}
				<div class="mt-4"><Alert message={form.error} /></div>
			{/if}

			{#if data.usuario}
				<form
					method="POST"
					action="?/comprar"
					class="mt-6 grid gap-6"
					use:enhance={() => {
						enviando = true;
						return async ({ update }) => {
							await update();
							enviando = false;
						};
					}}
				>
					<PaymentMethodPicker
						value={metodo}
						paypalHabilitado={data.paypalHabilitado}
						onselect={(m) => (metodo = m)}
					/>
					<button type="submit" disabled={enviando} class="btn-primary">
						{enviando ? 'Redirigiendo al pago…' : 'Comprar taller'}
					</button>
				</form>
			{:else}
				<p class="mt-4 text-sm text-white/60">
					Entra con tu correo o Google para comprar este taller.
				</p>
				<a href={enlaceAuth('/auth/login', ruta)} class="btn-primary mt-4">Entrar para comprar</a>
			{/if}
		</div>
	{/if}
</PageShell>
