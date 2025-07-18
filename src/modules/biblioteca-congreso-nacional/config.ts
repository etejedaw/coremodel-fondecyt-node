import { JsonFetchAdapter } from "../../core/adapters/fetch-adapter/JsonFetchAdapter";
import { RequestPromiseAdapter } from "../../core/adapters/fetch-adapter/RequestPromiseAdapter";
import {
	IndicatorBuilder,
	ModuleConfig
} from "../../core/utils/IndicatorBuilder";
import {
	OrganizacionesComunitariasParseAdapter,
	OrganizacionesComunitariasStorageAdapter,
	OrganizacionesComunitariasMapper
} from "./organizaciones-comunitarias";
import { TasaPobrezaIngresosParseAdapter } from "./tasa-pobreza-ingresos/parse-adapter";

export const BIBLIOTECA_CONGRESO_NACIONAL_CONFIG: ModuleConfig = {
	"valdivia-tasa-pobreza-ingresos": new IndicatorBuilder()
		.setName("Reporte Comunal Valdivia: Tasa de Pobreza por ingresos")
		.setUrl(
			"https://www.bcn.cl/siit/reportescomunales/comunas_v.html?anno={{year}}&idcom=14101"
		)
		.setFrequency("year")
		.setFetchAdapter(new RequestPromiseAdapter())
		.setParseAdapter(new TasaPobrezaIngresosParseAdapter())
		.build(),
	"valdivia-organizaciones-comunitaras": new IndicatorBuilder()
		.setName("Organizaciones Comunitarias en Valdivia")
		.setUrl(
			"https://www.bcn.cl/siit/estadisticasterritoriales/descargar-resultados/469123/datos.json"
		)
		.setFrequency("year")
		.setFetchAdapter(new JsonFetchAdapter())
		.setParseAdapter(new OrganizacionesComunitariasParseAdapter())
		.setMapperFunction(OrganizacionesComunitariasMapper)
		.setStorageAdapter(new OrganizacionesComunitariasStorageAdapter())
		.build()
} as const;
