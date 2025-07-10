import { RequestPromiseAdapter } from "../../core/adapters/fetch-adapter/RequestPromiseAdapter";
import {
	IndicatorBuilder,
	ModuleConfig
} from "../../core/utils/IndicatorBuilder";
import { TasaPobrezaIngresosAdapter } from "./adapters/TasaPobrezaIngresoAdapter";

export const BIBLIOTECA_CONGRESO_NACIONAL_CONFIG: ModuleConfig = {
	"valdivia-tasa-pobreza-ingresos": new IndicatorBuilder()
		.setName("Reporte Comunal Valdivia: Tasa de Pobreza por ingresos")
		.setUrl(
			"https://www.bcn.cl/siit/reportescomunales/comunas_v.html?anno={{year}}&idcom=14101"
		)
		.setFrequency("year")
		.setFetchAdapter(new RequestPromiseAdapter())
		.setParseAdapter(new TasaPobrezaIngresosAdapter())
		.build()
} as const;
