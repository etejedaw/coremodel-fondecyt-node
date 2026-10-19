import { MapperAdapter } from "../../../core/adapters/mapper-adapter/MapperAdapter";
import { Input, Output } from "./interfaces";

const PERCENT_DECIMALS = 2;

export class ParticipacionElectoralMapperAdapter implements MapperAdapter {
	map({
		eleccion,
		unidadTerritorial,
		inscritos,
		votantes,
		participacionFuente
	}: Input): Output {
		const registered = parseCount(inscritos);
		const voters = parseCount(votantes);
		return {
			eleccion,
			unidadTerritorial,
			inscritos: registered,
			votantes: voters,
			participacionFuente: roundPercent(parseDecimal(participacionFuente)),
			participacion: roundPercent((voters / registered) * 100)
		};
	}
}

function parseCount(value: string): number {
	return Number(value.replace(/\./g, ""));
}

function parseDecimal(value: string): number {
	return Number(value.replace(",", "."));
}

function roundPercent(value: number): number {
	return Number(value.toFixed(PERCENT_DECIMALS));
}
