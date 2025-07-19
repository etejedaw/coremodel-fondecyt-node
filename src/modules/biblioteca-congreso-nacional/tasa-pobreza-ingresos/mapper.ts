import { MapperAdater } from "../../../core/adapters/mapper-adapter/MapperAdapter";
import { Input, Output } from "./interfaces";

export class TasaPobrezaMapperAdapter implements MapperAdater {
	map(data: Input): Output {
		return {
			unidadTerritorial: data.unidadTerritorial,
			casen2017: Number(replaceDot(data.casen2017)),
			casen2022: Number(replaceDot(data.casen2022))
		};
	}
}

function replaceDot(data: string) {
	return data.replace(",", ".");
}
