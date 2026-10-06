import type { PageServerLoad } from './$types';
import type { Franja } from '$lib/types/agenda';


export const load: PageServerLoad = async () => {
	const franjas: Franja[] = [
		{ id: 1,date: '2026-10-02', startTime: '09:00', endTime: '10:00', available: true },
		{ id: 2, date: '2026-10-02', startTime: '10:00', endTime: '11:00', available: false },
		{ id: 3, date: '2026-10-02', startTime: '11:00', endTime: '12:00', available: true },
		{ id: 4, date: '2026-10-02', startTime: '12:00', endTime: '13:00', available: true },
		{ id: 5, date: '2026-10-02', startTime: '13:00', endTime: '14:00', available: false }
	];
	return { franjas };
};
