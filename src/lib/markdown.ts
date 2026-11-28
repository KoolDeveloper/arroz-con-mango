import { Marked, type Tokens, type TokenizerAndRendererExtension } from 'marked';

/**
 * Markdown de los talleres. Compartido entre servidor (página del taller) y cliente
 * (vista previa del dashboard) para que ambos se vean igual.
 *
 * - El HTML crudo se escapa: el contenido solo puede producir el HTML que genera Markdown.
 * - Enlaces/imágenes solo con http(s), mailto o rutas internas (nada de javascript:).
 * - Una URL de YouTube sola en su propia línea se convierte en un reproductor embebido.
 */

function escapar(s: string): string {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

const HOSTS_YOUTUBE = new Set([
	'youtube.com',
	'www.youtube.com',
	'm.youtube.com',
	'youtu.be',
	'www.youtube-nocookie.com',
	'youtube-nocookie.com'
]);
const ID_VALIDO = /^[A-Za-z0-9_-]{11}$/;

/** Segundos a partir de t=90, t=90s o t=1m30s. */
function segundos(t: string | null): number {
	if (!t) return 0;
	if (/^\d+s?$/.test(t)) return parseInt(t, 10);
	const m = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/.exec(t);
	return m ? Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0) : 0;
}

export function parsearYoutube(raw: string): { id: string; inicio: number } | null {
	let url: URL;
	try {
		url = new URL(raw.trim());
	} catch {
		return null;
	}
	if (!HOSTS_YOUTUBE.has(url.hostname)) return null;

	let id: string | null;
	if (url.hostname === 'youtu.be') {
		id = url.pathname.slice(1).split('/')[0];
	} else if (url.pathname === '/watch') {
		id = url.searchParams.get('v');
	} else {
		const m = /^\/(?:embed|shorts|live|v)\/([^/?#]+)/.exec(url.pathname);
		id = m?.[1] ?? null;
	}
	if (!id || !ID_VALIDO.test(id)) return null;
	return { id, inicio: segundos(url.searchParams.get('t') ?? url.searchParams.get('start')) };
}

export function htmlYoutube(id: string, inicio = 0): string {
	const src = `https://www.youtube-nocookie.com/embed/${id}${inicio ? `?start=${inicio}` : ''}`;
	return `<div class="video-embed"><iframe src="${src}" title="Video de YouTube" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>\n`;
}

type TokenYoutube = Tokens.Generic & { id: string; inicio: number };

const LINEA_URL_YOUTUBE =
	/^ {0,3}<?(https?:\/\/(?:www\.|m\.)?(?:youtube\.com|youtu\.be|youtube-nocookie\.com)\/[^\s>]+)>?[ \t]*(?:\n+|$)/;

const extensionYoutube: TokenizerAndRendererExtension = {
	name: 'youtube',
	level: 'block',
	// Permite que una URL de YouTube corte un párrafo aunque no haya línea en blanco antes
	start(src) {
		return /^ {0,3}<?https?:\/\/(?:www\.|m\.)?(?:youtube\.com|youtu\.be|youtube-nocookie\.com)\//m.exec(
			src
		)?.index;
	},
	tokenizer(src) {
		const m = LINEA_URL_YOUTUBE.exec(src);
		if (!m) return undefined;
		const video = parsearYoutube(m[1]);
		if (!video) return undefined;
		return { type: 'youtube', raw: m[0], ...video } satisfies TokenYoutube;
	},
	renderer(token) {
		const t = token as TokenYoutube;
		return htmlYoutube(t.id, t.inicio);
	}
};

function urlSegura(href: string, permitirMailto: boolean): string | null {
	const h = href.trim();
	if (h.startsWith('/') && !h.startsWith('//')) return h;
	if (h.startsWith('#')) return h;
	try {
		const u = new URL(h);
		if (u.protocol === 'https:' || u.protocol === 'http:') return u.toString();
		if (permitirMailto && u.protocol === 'mailto:') return u.toString();
	} catch {
		/* URL inválida */
	}
	return null;
}

const marked = new Marked({ gfm: true, breaks: true });

marked.use({
	extensions: [extensionYoutube],
	renderer: {
		html({ text }) {
			return escapar(text);
		},
		link({ href, title, tokens }) {
			const texto = this.parser.parseInline(tokens);
			const seguro = urlSegura(href, true);
			if (!seguro) return texto;
			const externo = /^https?:/.test(seguro);
			return `<a href="${escapar(seguro)}"${title ? ` title="${escapar(title)}"` : ''}${
				externo ? ' target="_blank" rel="noopener noreferrer"' : ''
			}>${texto}</a>`;
		},
		image({ href, title, text }) {
			const seguro = urlSegura(href, false);
			if (!seguro) return escapar(text);
			return `<img src="${escapar(seguro)}" alt="${escapar(text)}"${
				title ? ` title="${escapar(title)}"` : ''
			} loading="lazy" />`;
		}
	}
});

export function renderMarkdown(md: string): string {
	return marked.parse(md ?? '', { async: false });
}
