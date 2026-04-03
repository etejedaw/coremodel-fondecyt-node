import { ModuleConfig } from "./IndicatorBuilder";
import { ParseError } from "./errors";

export abstract class ScrapeBase {
	readonly #moduleConfig: ModuleConfig;
	readonly #moduleName: string;

	constructor(moduleName: string, moduleConfig: ModuleConfig) {
		this.#moduleName = moduleName;
		this.#moduleConfig = moduleConfig;
	}

	getIndicators() {
		return Object.keys(this.#moduleConfig);
	}

	getName() {
		return this.#moduleName;
	}

	getIndicatorName(indicator: string) {
		return this.#moduleConfig[indicator].name;
	}

	getIndicatorDescription(indicator: string) {
		return this.#moduleConfig[indicator].description;
	}

	getIndicatorUrl(indicator: string) {
		return this.#moduleConfig[indicator].url;
	}

	getIndicatorFrequency(indicator: string) {
		return this.#moduleConfig[indicator].frequency;
	}

	getStorageAdapter(indicator: string) {
		return this.#moduleConfig[indicator].storageAdapter;
	}

	#buildUrl(url: string, params: Record<string, string>) {
		return Object.entries(params).reduce((acc, [key, value]) => {
			return acc.replace(new RegExp(`{{${key}}}`, "g"), value.toString());
		}, url);
	}

	async init(indicator: string, params: Record<string, string> = {}) {
		const indicatorUrl = this.getIndicatorUrl(indicator);
		const url = this.#buildUrl(indicatorUrl, params);

		const fetchAdapter = this.#moduleConfig[indicator].fetchAdapter;
		const fetch = await fetchAdapter.fetch(url);

		const parseAdapter = this.#moduleConfig[indicator].parseAdapter;
		const parse = parseAdapter.extract(fetch);
		if (!parse.length) throw new ParseError(indicator, url);

		const hasher = this.#moduleConfig[indicator].hashAdapter;
		const mapperAdapter = this.#moduleConfig[indicator].mapperAdapter.map;

		const data = parse
			.map(mapperAdapter)
			.map(data => ({ ...data, indicator, module: this.getName() }))
			.map(data => ({ ...data, key: hasher.generate(data) }));

		const storageAdapter = this.#moduleConfig[indicator].storageAdapter;
		await storageAdapter.save(data);

		const calculator = this.#moduleConfig[indicator].calculatorAdapter;
		if (calculator) return { data, calculated: calculator.calculate(data) };

		return { data };
	}
}
