import { MapperAdapter } from "../../core/adapters/mapper-adapter/MapperAdapter";
import { Input, Output } from "./interfaces";

export class EmergenciaDesastresMapper implements MapperAdapter {
	map(data: Input): Output {
		const { date, place } = data;
		const newDate = new Date(
			date.year,
			transformMonthToNumber(date.month),
			date.day
		);

		return {
			date: newDate,
			place: place.type,
			city: place.city
		};
	}
}

function transformMonthToNumber(month: string) {
	const MONTH_MAP = {
		Ene: 0,
		Feb: 1,
		Mar: 2,
		Abr: 3,
		May: 4,
		Jun: 5,
		Jul: 6,
		Ago: 7,
		Sep: 8,
		Oct: 9,
		Nov: 10,
		Dic: 11
	} as const;
	return MONTH_MAP[month as keyof typeof MONTH_MAP];
}
