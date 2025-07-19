import { MapperFunction } from "../../../core/utils/MapperFunction";

export const TasaPobrezaIngresosMapper: MapperFunction = data => ({
	unidadTerritorial: data.unidadTerritorial,
	casen2017: Number((data.casen2017 as string).replace(",", ".")),
	casen2022: Number((data.casen2022 as string).replace(",", "."))
});
