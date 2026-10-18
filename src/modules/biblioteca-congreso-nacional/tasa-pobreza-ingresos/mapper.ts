import { MapperAdapter } from "../../../core/adapters/mapper-adapter/MapperAdapter";
import { Input, Output } from "./interfaces";

export class TasaPobrezaMapperAdapter implements MapperAdapter {
	map({ unidadTerritorial, ...measurements }: Input): Output {
		const rates = Object.fromEntries(
			Object.entries(measurements).map(([field, value]) => [
				field,
				Number(replaceDot(value))
			])
		);
		return { unidadTerritorial, ...rates } as Output;
	}
}

function replaceDot(data: string) {
	return data.replace(",", ".");
}
