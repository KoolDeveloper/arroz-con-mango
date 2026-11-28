import { drizzle } from 'drizzle-orm/d1';
import { and, desc, eq } from 'drizzle-orm';
import { error, fail, redirect } from '@sveltejs/kit';
import { talleres, usuarios, usuariosTalleres } from '$lib/server/db/schema';
import { emailValido, normalizarEmail } from '$lib/server/auth';

export const load = async ({ params, platform }) => {
	const d1 = platform?.env?.therapist_db;
	if (!d1) throw new Error('Base de datos no conectada');
	if (params.id === 'nuevo') return { taller: null, accesos: [] };

	const db = drizzle(d1);
	const [taller] = await db.select().from(talleres).where(eq(talleres.id, params.id));
	if (!taller) error(404, 'Taller no encontrado');

	const accesos = await db
		.select({
			usuarioId: usuarios.id,
			nombre: usuarios.nombre,
			email: usuarios.email,
			estado: usuariosTalleres.estado,
			creadoEn: usuariosTalleres.creadoEn,
			aprobadoEn: usuariosTalleres.aprobadoEn
		})
		.from(usuariosTalleres)
		.innerJoin(usuarios, eq(usuariosTalleres.usuarioId, usuarios.id))
		.where(eq(usuariosTalleres.tallerId, taller.id))
		.orderBy(desc(usuariosTalleres.creadoEn));

	return { taller, accesos };
};

export const actions = {
	guardar: async ({ params, request, platform }) => {
		const d1 = platform?.env?.therapist_db;
		if (!d1) return fail(500, { error: 'DB no conectada' });
		const db = drizzle(d1);

		const form = await request.formData();
		const nombre = form.get('nombre')?.toString().trim() ?? '';
		const precio = Number(form.get('precio'));
		const descripcion = form.get('descripcion')?.toString().trim() ?? '';
		const contenido = form.get('contenido')?.toString() ?? '';
		const publicado = form.get('publicado') === 'on';

		if (!nombre) return fail(400, { error: 'El nombre es obligatorio.' });
		if (!Number.isInteger(precio) || precio <= 0) {
			return fail(400, { error: 'El precio debe ser un número entero mayor a 0 (COP).' });
		}

		const datos = { nombre, precio, descripcion, contenido, publicado, actualizadoEn: new Date() };

		if (params.id === 'nuevo') {
			const [nuevo] = await db.insert(talleres).values(datos).returning({ id: talleres.id });
			redirect(303, `/dashboard/talleres/${nuevo.id}?guardado=1`);
		}

		await db.update(talleres).set(datos).where(eq(talleres.id, params.id));
		return { guardado: true };
	},

	/** Da acceso manual (cortesía, transferencia, etc.). Crea el usuario si no existe:
	 *  al registrarse con ese correo heredará el acceso. */
	darAcceso: async ({ params, request, platform }) => {
		const d1 = platform?.env?.therapist_db;
		if (!d1) return fail(500, { error: 'DB no conectada' });
		const db = drizzle(d1);

		const email = normalizarEmail((await request.formData()).get('email')?.toString());
		if (!emailValido(email)) return fail(400, { errorAcceso: 'Correo inválido.' });

		const [usuario] = await db
			.insert(usuarios)
			.values({ nombre: email.split('@')[0], email })
			.onConflictDoUpdate({ target: usuarios.email, set: { email } })
			.returning({ id: usuarios.id });

		await db
			.insert(usuariosTalleres)
			.values({
				usuarioId: usuario.id,
				tallerId: params.id,
				estado: 'aprobado',
				aprobadoEn: new Date()
			})
			.onConflictDoUpdate({
				target: [usuariosTalleres.usuarioId, usuariosTalleres.tallerId],
				set: { estado: 'aprobado', aprobadoEn: new Date() }
			});

		return { accesoOk: `Acceso otorgado a ${email}.` };
	},

	quitarAcceso: async ({ params, request, platform }) => {
		const d1 = platform?.env?.therapist_db;
		if (!d1) return fail(500, { error: 'DB no conectada' });
		const usuarioId = (await request.formData()).get('usuarioId')?.toString();
		if (!usuarioId) return fail(400, { errorAcceso: 'Usuario requerido.' });

		await drizzle(d1)
			.update(usuariosTalleres)
			.set({ estado: 'rechazado', aprobadoEn: null })
			.where(
				and(eq(usuariosTalleres.usuarioId, usuarioId), eq(usuariosTalleres.tallerId, params.id))
			);
		return { accesoOk: 'Acceso revocado.' };
	}
};
