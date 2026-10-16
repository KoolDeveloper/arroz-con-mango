import type { Franja } from '$lib/types/agenda';
import type { D1Database } from '@cloudflare/workers-types';

// D1Database es el tipo global inyectado por Cloudflare
export const franjasDB = {
	// Leer franjas (todas o filtradas por fecha)
	async getAll(db: D1Database, date?: string | null): Promise<Franja[]> {
		let query = 'SELECT * FROM Franja ORDER BY date ASC, startTime ASC';
		let params: any[] = [];

		if (date) {
			query = 'SELECT * FROM Franja WHERE date = ? ORDER BY startTime ASC';
			params = [date];
		}

		const { results } = await db
			.prepare(query)
			.bind(...params)
			.all();

		// Mapear el 0/1 de SQLite al boolean de TypeScript
		return results.map((row) => ({
			...row,
			available: row.available === 1
		})) as Franja[];
	},

	// Crear una nueva franja
	async create(db: D1Database, data: Omit<Franja, 'id'>): Promise<string | null> {
		const id = crypto.randomUUID(); // Nativo en el entorno Edge de Cloudflare
		const availableInt = data.available ? 1 : 0;

		const { success } = await db
			.prepare(
				'INSERT INTO Franja (id, date, startTime, endTime, available) VALUES (?, ?, ?, ?, ?)'
			)
			.bind(id, data.date, data.startTime, data.endTime, availableInt)
			.run();

		return success ? id : null;
	},

	// Eliminar una franja
	async delete(db: D1Database, id: string): Promise<boolean> {
		const { success } = await db.prepare('DELETE FROM Franja WHERE id = ?').bind(id).run();
		return success;
	}
};
