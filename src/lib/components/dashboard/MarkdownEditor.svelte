<script lang="ts">
	import { tick } from 'svelte';
	import { parsearYoutube, renderMarkdown } from '$lib/markdown';

	type Props = { name: string; value: string; oninput?: () => void };
	let { name, value = $bindable(), oninput }: Props = $props();

	let textarea = $state<HTMLTextAreaElement>();
	let vista = $state<'dividida' | 'editor' | 'vista'>('dividida');
	let urlVideo = $state('');
	let errorVideo = $state('');
	let mostrandoVideo = $state(false);

	const html = $derived(renderMarkdown(value));

	const EJEMPLO =
		'## Bienvenida\n\nEscribe el contenido en Markdown.\n\nPega un enlace de YouTube en su propia línea para mostrar el video:\n\nhttps://www.youtube.com/watch?v=…';

	/** Reemplaza la selección y deja seleccionado el texto indicado. */
	async function reemplazar(
		inicio: number,
		fin: number,
		texto: string,
		selIni: number,
		selFin: number
	) {
		value = value.slice(0, inicio) + texto + value.slice(fin);
		oninput?.();
		await tick();
		textarea?.focus();
		textarea?.setSelectionRange(selIni, selFin);
	}

	function envolver(antes: string, despues = antes, ejemplo = 'texto') {
		if (!textarea) return;
		const { selectionStart: s, selectionEnd: e } = textarea;
		const sel = value.slice(s, e) || ejemplo;
		reemplazar(s, e, antes + sel + despues, s + antes.length, s + antes.length + sel.length);
	}

	/** Agrega un prefijo al inicio de cada línea seleccionada (títulos, listas, citas). */
	function prefijo(p: string) {
		if (!textarea) return;
		const { selectionStart: s, selectionEnd: e } = textarea;
		const ini = value.lastIndexOf('\n', s - 1) + 1;
		const bloque = value.slice(ini, e);
		const nuevo = bloque
			.split('\n')
			.map((l) => p + l.replace(/^(#{1,6} |> |- |\d+\. )/, ''))
			.join('\n');
		reemplazar(ini, e, nuevo, ini, ini + nuevo.length);
	}

	/** Inserta un bloque en su propia línea, separado por líneas en blanco. */
	function insertarBloque(texto: string) {
		if (!textarea) return;
		const s = textarea.selectionStart;
		const antes = value.slice(0, s);
		const pre =
			antes.length === 0 || antes.endsWith('\n\n') ? '' : antes.endsWith('\n') ? '\n' : '\n\n';
		const bloque = `${pre}${texto}\n\n`;
		const fin = s + bloque.length;
		reemplazar(s, textarea.selectionEnd, bloque, fin, fin);
	}

	function enlace() {
		envolver('[', '](https://)', 'texto del enlace');
	}

	function confirmarVideo() {
		const video = parsearYoutube(urlVideo);
		if (!video) {
			errorVideo = 'No parece un enlace válido de YouTube (watch, youtu.be, shorts o embed).';
			return;
		}
		insertarBloque(urlVideo.trim());
		urlVideo = '';
		errorVideo = '';
		mostrandoVideo = false;
	}

	function atajos(ev: KeyboardEvent) {
		if (!(ev.ctrlKey || ev.metaKey)) return;
		if (ev.key === 'b') {
			ev.preventDefault();
			envolver('**');
		} else if (ev.key === 'i') {
			ev.preventDefault();
			envolver('_');
		} else if (ev.key === 'k') {
			ev.preventDefault();
			enlace();
		}
	}

	const botones = [
		{ etiqueta: 'B', titulo: 'Negrita (Ctrl+B)', clase: 'font-bold', accion: () => envolver('**') },
		{ etiqueta: 'I', titulo: 'Cursiva (Ctrl+I)', clase: 'italic', accion: () => envolver('_') },
		{ etiqueta: 'H2', titulo: 'Título', clase: '', accion: () => prefijo('## ') },
		{ etiqueta: 'H3', titulo: 'Subtítulo', clase: '', accion: () => prefijo('### ') },
		{ etiqueta: '• Lista', titulo: 'Lista', clase: '', accion: () => prefijo('- ') },
		{ etiqueta: '1. Lista', titulo: 'Lista numerada', clase: '', accion: () => prefijo('1. ') },
		{ etiqueta: '❝ Cita', titulo: 'Cita', clase: '', accion: () => prefijo('> ') },
		{ etiqueta: 'Enlace', titulo: 'Enlace (Ctrl+K)', clase: '', accion: enlace },
		{
			etiqueta: '— Separador',
			titulo: 'Línea separadora',
			clase: '',
			accion: () => insertarBloque('---')
		}
	];
</script>

<div class="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
	<div class="flex flex-wrap items-center gap-1 border-b border-white/10 bg-black/30 p-2">
		{#each botones as b (b.etiqueta)}
			<button
				type="button"
				title={b.titulo}
				onclick={b.accion}
				class="rounded-full px-3 py-1 text-sm text-white/70 transition hover:bg-white/10 hover:text-white {b.clase}"
			>
				{b.etiqueta}
			</button>
		{/each}
		<button
			type="button"
			onclick={() => (mostrandoVideo = !mostrandoVideo)}
			class="rounded-full bg-red-600 px-3 py-1 text-sm font-medium text-white transition hover:bg-red-500"
		>
			▶ Video YouTube
		</button>

		<div class="ml-auto flex overflow-hidden rounded-full border border-white/15 text-xs">
			{#each [['editor', 'Editor'], ['dividida', 'Dividida'], ['vista', 'Vista previa']] as const as [id, etiqueta] (id)}
				<button
					type="button"
					onclick={() => (vista = id)}
					class="px-2.5 py-1 {vista === id
						? 'bg-accent text-black'
						: 'text-white/60 hover:bg-white/10'}"
				>
					{etiqueta}
				</button>
			{/each}
		</div>
	</div>

	{#if mostrandoVideo}
		<div class="flex flex-wrap items-start gap-2 border-b border-white/10 bg-red-500/10 p-3">
			<div class="min-w-64 flex-1">
				<input
					type="url"
					bind:value={urlVideo}
					placeholder="https://www.youtube.com/watch?v=…"
					class="field field-sm"
					onkeydown={(e) => {
						if (e.key === 'Enter') {
							e.preventDefault();
							confirmarVideo();
						}
					}}
				/>
				{#if errorVideo}<p class="mt-1 text-xs text-red-300">{errorVideo}</p>{/if}
				<p class="mt-1 text-xs text-white/50">
					Se inserta en su propia línea y se muestra como reproductor. Usa videos “No listados” en
					YouTube para que solo los vea quien compró el taller.
				</p>
			</div>
			<button
				type="button"
				onclick={confirmarVideo}
				class="btn-sm rounded-full bg-red-600 font-semibold text-white"
			>
				Insertar
			</button>
		</div>
	{/if}

	<div class="grid {vista === 'dividida' ? 'lg:grid-cols-2' : ''}">
		<textarea
			bind:this={textarea}
			{name}
			bind:value
			oninput={() => oninput?.()}
			onkeydown={atajos}
			rows="24"
			spellcheck="true"
			placeholder={EJEMPLO}
			class="min-h-[28rem] w-full resize-y bg-black/30 p-4 font-mono text-sm text-white outline-none placeholder:text-white/30 {vista ===
			'vista'
				? 'hidden'
				: ''}"></textarea>

		{#if vista !== 'editor'}
			<!-- Misma apariencia (fondo oscuro) que la página pública del taller -->
			<div
				class="max-h-[44rem] min-h-[28rem] overflow-y-auto border-l border-white/10 bg-background p-6"
			>
				{#if value.trim()}
					<article class="prose max-w-none prose-invert prose-a:text-accent">
						<!-- eslint-disable-next-line svelte/no-at-html-tags -- HTML generado por renderMarkdown (HTML crudo escapado, URLs filtradas) -->
						{@html html}
					</article>
				{:else}
					<p class="text-sm text-white/40">La vista previa aparecerá aquí.</p>
				{/if}
			</div>
		{/if}
	</div>
</div>
