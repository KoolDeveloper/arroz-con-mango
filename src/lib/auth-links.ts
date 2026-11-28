import { resolve } from '$app/paths';
import type { ResolvedPathname } from '$app/types';

type RutaAuth = '/auth/login' | '/auth/google';

/** Enlace a una página de auth que, al terminar, devuelve al usuario a `redirectTo`. */
export function enlaceAuth(ruta: RutaAuth, redirectTo: string): ResolvedPathname {
	return `${resolve(ruta)}?redirectTo=${encodeURIComponent(redirectTo)}` as ResolvedPathname;
}
