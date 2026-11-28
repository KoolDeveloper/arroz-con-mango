// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

import type { D1Database } from '@cloudflare/workers-types';
import type { UsuarioSesion } from '$lib/server/auth';

declare global {
	namespace App {
		interface Locals {
			usuario: UsuarioSesion | null;
		}
		interface Platform {
			env: {
				therapist_db: D1Database;
				PUBLIC_URL?: string;
				// Mercado Pago (pagos locales, COP)
				MP_ACCESS_TOKEN?: string;
				// PayPal (pagos internacionales, USD)
				PAYPAL_CLIENT_ID?: string;
				PAYPAL_CLIENT_SECRET?: string;
				PAYPAL_ENV?: 'sandbox' | 'live';
				PAYPAL_COP_USD_RATE?: string;
				// Login con Google (OAuth 2.0)
				GOOGLE_CLIENT_ID?: string;
				GOOGLE_CLIENT_SECRET?: string;
				// Correos transaccionales (Resend)
				RESEND_API_KEY?: string;
				EMAIL_FROM?: string;
			};
		}
	}
}

export {};
