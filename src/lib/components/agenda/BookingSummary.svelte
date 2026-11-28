<script lang="ts">
	import type { TipoCitaSelect } from '$lib/server/db/schema';
	import { formatearFecha, type Bloque } from '$lib/agenda/slots';
	import { formatearPrecio } from '$lib/formato';

	type Props = { servicio: TipoCitaSelect; fecha: string; bloque: Bloque };
	let { servicio, fecha, bloque }: Props = $props();
</script>

<div
	class="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-accent/30 bg-accent/10 px-5 py-4"
>
	<div>
		<p class="text-xs tracking-widest text-accent uppercase">Tu reserva</p>
		<p class="mt-1 font-semibold">{servicio.nombre}</p>
		<p class="text-sm text-white/70 first-letter:uppercase">
			{formatearFecha(fecha).largo} · {bloque.startTime} – {bloque.endTime}
		</p>
	</div>
	<p class="font-title text-3xl text-accent">
		{formatearPrecio(servicio.precio)}
		<span class="font-main text-xs text-white/50">COP</span>
	</p>
</div>
