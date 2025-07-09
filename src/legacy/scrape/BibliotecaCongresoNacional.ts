import {
	BibliotecaCongresoNacionalFactory,
	EstadisticasTerritorialesFactory,
	ReporteComunalFactory
} from "../../libs/dataExtractor/bibliotecaCongresoNacional";
import { Getter, HtmlExtractor } from "../../libs/htmlExtractor";

export class BibliotecaCongresoNacional {
	readonly #url: string;
	readonly #extractor: HtmlExtractor;
	readonly #factory: BibliotecaCongresoNacionalFactory;

	constructor(
		url: string,
		extractor: HtmlExtractor,
		factoryType: FactoryTypes
	) {
		this.#url = url;
		this.#extractor = extractor;
		this.#factory = this.#getFactory(factoryType);
	}

	async init(): Promise<any> {
		const dataUrl = await this.#getData();
		if (this.#factory instanceof ReporteComunalFactory) return dataUrl;
		const promises = dataUrl.map(data => this.#scrape(data.link));
		const data = await Promise.all(promises);
		return data.map(info => info.datosTemaN);
	}

	async #getData(): Promise<any[]> {
		const bibliotecaCongresoNacional = this.#factory.createDataExtractor(
			this.#url,
			this.#extractor
		);
		return await bibliotecaCongresoNacional.search();
	}

	async #scrape(url: string): Promise<any> {
		const getter = await Getter.build(url, this.#extractor);
		if (!getter.html) return;
		return JSON.parse(getter.html);
	}

	#getFactory(type: FactoryTypes): BibliotecaCongresoNacionalFactory {
		if (type === "estadistica_territorial")
			return new EstadisticasTerritorialesFactory();
		if (type === "reporte_comunal") return new ReporteComunalFactory();
		throw new Error("Factory no encontrado");
	}
}

type FactoryTypes = "estadistica_territorial" | "reporte_comunal";
