import { readEnv } from '$lib/server/payments';

type PlatformEnv = Record<string, unknown> | undefined;

type Correo = { para: string; asunto: string; html: string; texto: string };

/**
 * Envía un correo transaccional con Resend (API HTTP: funciona en Workers, a diferencia de SMTP).
 * Si no está configurado, lo deja en el log para poder probar en desarrollo y devuelve false.
 */
export async function enviarCorreo(correo: Correo, platformEnv?: PlatformEnv): Promise<boolean> {
	const apiKey = readEnv('RESEND_API_KEY', platformEnv);
	const from = readEnv('EMAIL_FROM', platformEnv);

	if (!apiKey || !from) {
		console.warn(
			`[email] RESEND_API_KEY / EMAIL_FROM sin configurar. Correo para ${correo.para}:\n${correo.texto}`
		);
		return false;
	}

	const res = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
		body: JSON.stringify({
			from,
			to: [correo.para],
			subject: correo.asunto,
			html: correo.html,
			text: correo.texto
		})
	});

	if (!res.ok) {
		console.error('Error enviando correo (Resend):', res.status, await res.text());
		return false;
	}
	return true;
}

export function correoCodigo(codigo: string): Omit<Correo, 'para'> {
	return {
		asunto: `${codigo} es tu código de acceso · Alejo Mentor`,
		texto: `Tu código para entrar es: ${codigo}\n\nVence en 10 minutos. Si no lo pediste, ignora este correo.`,
		html: `<div style="font-family:system-ui,sans-serif;color:#41342f">
<p>Tu código para entrar a Alejo Mentor es:</p>
<p style="font-size:32px;font-weight:700;letter-spacing:8px;color:#f2762b">${escaparHtml(codigo)}</p>
<p>Vence en 10 minutos. Si no lo pediste, ignora este correo.</p>
</div>`
	};
}

function escaparHtml(s: string) {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}
