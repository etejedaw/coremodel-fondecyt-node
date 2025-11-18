import { RequestPromiseAdapter } from "../../core/adapters/fetch-adapter/RequestPromiseAdapter";
import { DateParserAdapter } from "./parse-adapter";
import { IndicatorBuilder, ModuleConfig } from "../../core/IndicatorBuilder";
import { FREQUENCIES } from "../../core/enums/Frequencies";

export const EMERGENCIA_DESASTRES_CONFIG: ModuleConfig = {
	"simulacros-2021": new IndicatorBuilder()
		.setName("Simulacros 2021")
		.setUrl(
			"https://web.archive.org/web/20211026024955/https://emergenciaydesastres.mineduc.cl/simulacros-2021/"
		)
		.setFrequency(FREQUENCIES.once)
		.setFetchAdapter(new RequestPromiseAdapter())
		.setParseAdapter(new DateParserAdapter())
		.build(),
	"simulacros-2022": new IndicatorBuilder()
		.setName("Simulacros 2022")
		.setUrl("https://emergenciaydesastres.mineduc.cl/simulacros-2022/")
		.setFrequency(FREQUENCIES.once)
		.setFetchAdapter(new RequestPromiseAdapter())
		.setParseAdapter(new DateParserAdapter())
		.build(),
	"simulacros-2023": new IndicatorBuilder()
		.setName("Simulacros 2023")
		.setUrl("https://emergenciaydesastres.mineduc.cl/simulacros-2023/")
		.setFrequency(FREQUENCIES.once)
		.setFetchAdapter(new RequestPromiseAdapter())
		.setParseAdapter(new DateParserAdapter())
		.build()
} as const;
