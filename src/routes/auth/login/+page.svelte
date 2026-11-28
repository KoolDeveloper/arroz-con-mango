<script lang="ts">
	import { enhance } from '$app/forms';
	import PageShell from '$lib/components/ui/PageShell.svelte';
	import SectionHeader from '$lib/components/ui/SectionHeader.svelte';
	import GoogleButton from '$lib/components/auth/GoogleButton.svelte';
	import Alert from '$lib/components/ui/Alert.svelte';
	import { enlaceAuth } from '$lib/auth-links';

	let { data, form } = $props();
	let enviando = $state(false);

	const paso = $derived(form?.paso ?? 'email');
	const email = $derived(form?.email ?? '');

	const conCarga = () => {
		enviando = true;
		return async ({ update }: { update: () => Promise<void> }) => {
			await update();
			enviando = false;
		};
	};
</script>

<svelte:head><title>Entrar · Alejo Mentor</title></svelte:head>

<PageShell centrado ancho="max-w-md">
	<div class="glass-card">
		<SectionHeader
			kicker="Talleres"
			titulo="Entrar"
			subtitulo={paso === 'email'
				? 'Sin contraseñas: te enviamos un código a tu correo.'
				: 'Escribe el código de 6 dígitos que te enviamos.'}
		/>

		<div class="mt-8">
			{#if form?.error}
				<Alert message={form.error} />
			{:else if form?.aviso}
				<Alert tone="ok" message={form.aviso} />
			{:else if data.errorGoogle}
				<Alert message="No se pudo entrar con Google. Inténtalo de nuevo." />
			{/if}

			{#if paso === 'email'}
				{#if data.google}
					<GoogleButton redirectTo={data.redirectTo} />
				{/if}

				<form method="POST" action="?/enviar" class="grid gap-4" use:enhance={conCarga}>
					<label>
						<span class="field-label">Correo</span>
						<input
							class="field"
							type="email"
							name="email"
							autocomplete="email"
							required
							value={email}
						/>
					</label>
					<button type="submit" disabled={enviando} class="btn-primary mt-2">
						{enviando ? 'Enviando…' : 'Enviarme un código'}
					</button>
				</form>
			{:else}
				<form method="POST" action="?/verificar" class="grid gap-4" use:enhance={conCarga}>
					<input type="hidden" name="email" value={email} />
					<input type="hidden" name="redirectTo" value={data.redirectTo} />
					<label>
						<span class="field-label">Código</span>
						<!-- svelte-ignore a11y_autofocus -->
						<input
							class="field text-center font-mono text-2xl tracking-[0.5em]"
							name="codigo"
							inputmode="numeric"
							autocomplete="one-time-code"
							pattern="[0-9]{6}"
							maxlength="6"
							required
							autofocus
						/>
					</label>
					<button type="submit" disabled={enviando} class="btn-primary mt-2">
						{enviando ? 'Verificando…' : 'Entrar'}
					</button>
				</form>

				<form
					method="POST"
					action="?/enviar"
					use:enhance={conCarga}
					class="mt-6 flex justify-center gap-4 text-sm text-white/60"
				>
					<input type="hidden" name="email" value={email} />
					<button type="submit" class="hover:text-accent">Reenviar código</button>
					<span aria-hidden="true">·</span>
					<a href={enlaceAuth('/auth/login', data.redirectTo)} class="hover:text-accent"
						>Usar otro correo</a
					>
				</form>
			{/if}
		</div>
	</div>
</PageShell>
