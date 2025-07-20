import { JsonFetchAdapter } from "../../core/adapters/fetch-adapter/JsonFetchAdapter";
import { RequestPromiseAdapter } from "../../core/adapters/fetch-adapter/RequestPromiseAdapter";
import { IndicatorBuilder, ModuleConfig } from "../../core/IndicatorBuilder";
import {
	OrganizacionesComunitariasParseAdapter,
	OrganizacionesComunitariasStorageAdapter,
	OrganizacionesComunitariasMapperAdapter
} from "./organizaciones-comunitarias";
import { OrganizacionesComunitariasHashAdapter } from "./organizaciones-comunitarias/hash";
import {
	TasaPobrezaMapperAdapter,
	TasaPobrezaIngresosParseAdapter,
	TasaPobrezaIngresosStorageAdapter
} from "./tasa-pobreza-ingresos";
import { TasaPobrezaIngresosHashAdapter } from "./tasa-pobreza-ingresos/hash";

export const BIBLIOTECA_CONGRESO_NACIONAL_CONFIG: ModuleConfig = {
	"valdivia-tasa-pobreza-ingresos": new IndicatorBuilder()
		.setName("Reporte Comunal Valdivia: Tasa de Pobreza por ingresos")
		.setUrl(
			"https://www.bcn.cl/siit/reportescomunales/comunas_v.html?anno={{year}}&idcom=14101"
		)
		.setFrequency("year")
		.setFetchAdapter(new RequestPromiseAdapter())
		.setParseAdapter(new TasaPobrezaIngresosParseAdapter())
		.setMapperAdapter(new TasaPobrezaMapperAdapter())
		.setStorageAdapter(new TasaPobrezaIngresosStorageAdapter())
		.setHashAdapter(new TasaPobrezaIngresosHashAdapter())
		.build(),
	"valdivia-organizaciones-comunitaras": new IndicatorBuilder()
		.setName("Organizaciones Comunitarias en Valdivia")
		.setUrl(
			"https://www.bcn.cl/siit/estadisticasterritoriales/descargar-resultados/469123/datos.json"
		)
		.setFrequency("year")
		.setFetchAdapter(new JsonFetchAdapter())
		.setParseAdapter(new OrganizacionesComunitariasParseAdapter())
		.setMapperAdapter(new OrganizacionesComunitariasMapperAdapter())
		.setStorageAdapter(new OrganizacionesComunitariasStorageAdapter())
		.setHashAdapter(new OrganizacionesComunitariasHashAdapter())
		.build()
} as const;
