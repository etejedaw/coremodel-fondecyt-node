import { JsonFetchAdapter } from "../../core/adapters/fetch-adapter/JsonFetchAdapter";
import { RequestPromiseAdapter } from "../../core/adapters/fetch-adapter/RequestPromiseAdapter";
import { FREQUENCIES } from "../../core/enums/Frequencies";
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
import {
	ParticipacionElectoralMapperAdapter,
	ParticipacionElectoralParseAdapter,
	ParticipacionElectoralStorageAdapter
} from "./participacion-electoral";
import { ParticipacionElectoralHashAdapter } from "./participacion-electoral/hash";

const PREVIOUS_YEARS_TO_TRY = 2;

const resolveCurrentAndPreviousYears = () => {
	const currentYear = new Date().getFullYear();
	return Array.from({ length: PREVIOUS_YEARS_TO_TRY + 1 }, (_, offset) => ({
		year: String(currentYear - offset)
	}));
};

export const BIBLIOTECA_CONGRESO_NACIONAL_CONFIG: ModuleConfig = {
	"valdivia-tasa-pobreza-ingresos": new IndicatorBuilder()
		.setName("Reporte Comunal Valdivia: Tasa de Pobreza por ingresos")
		.setUrl(
			"https://www.bcn.cl/siit/reportescomunales/comunas_v.html?anno={{year}}&idcom=14101"
		)
		.setFrequency(FREQUENCIES.year)
		.setScheduledParams(resolveCurrentAndPreviousYears)
		.setFetchAdapter(new RequestPromiseAdapter())
		.setParseAdapter(new TasaPobrezaIngresosParseAdapter())
		.setMapperAdapter(new TasaPobrezaMapperAdapter())
		.setStorageAdapter(new TasaPobrezaIngresosStorageAdapter())
		.setHashAdapter(new TasaPobrezaIngresosHashAdapter())
		.build(),
	"valdivia-organizaciones-comunitarias": new IndicatorBuilder()
		.setName("Organizaciones Comunitarias en Valdivia")
		.setUrl(
			"https://www.bcn.cl/siit/estadisticasterritoriales/descargar-resultados/469123/datos.json"
		)
		.setFrequency(FREQUENCIES.year)
		.setFetchAdapter(new JsonFetchAdapter())
		.setParseAdapter(new OrganizacionesComunitariasParseAdapter())
		.setMapperAdapter(new OrganizacionesComunitariasMapperAdapter())
		.setStorageAdapter(new OrganizacionesComunitariasStorageAdapter())
		.setHashAdapter(new OrganizacionesComunitariasHashAdapter())
		.build(),
	"valdivia-participacion-electoral": new IndicatorBuilder()
		.setName("Reporte Comunal Valdivia: Participación electoral")
		.setUrl(
			"https://www.bcn.cl/siit/reportescomunales/comunas_v.html?anno={{year}}&idcom=14101"
		)
		.setFrequency(FREQUENCIES.year)
		.setScheduledParams(resolveCurrentAndPreviousYears)
		.setFetchAdapter(new RequestPromiseAdapter())
		.setParseAdapter(new ParticipacionElectoralParseAdapter())
		.setMapperAdapter(new ParticipacionElectoralMapperAdapter())
		.setStorageAdapter(new ParticipacionElectoralStorageAdapter())
		.setHashAdapter(new ParticipacionElectoralHashAdapter())
		.build()
} as const;
