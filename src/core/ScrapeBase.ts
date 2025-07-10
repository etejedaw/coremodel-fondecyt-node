import { ModuleConfig } from "./utils/IndicatorBuilder";

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

	getIndicatorDescription(indicator: string) {
		return this.#moduleConfig[indicator].description;
	}

	getIndicatorUrl(indicator: string) {
		return this.#moduleConfig[indicator].url;
	}

	#getFetchAdapter(indicator: string) {
		return this.#moduleConfig[indicator].fetchAdapter;
	}

	#getParseAdapter(indicator: string) {
		return this.#moduleConfig[indicator].parseAdapter;
	}

	#buildUrl(url: string, params: Record<string, string>) {
		return Object.entries(params).reduce((acc, [key, value]) => {
			return acc.replace(new RegExp(`{{${key}}}`, "g"), value.toString());
		}, url);
	}

	async init(indicator: string, params: Record<string, string> = {}) {
		const indicatorUrl = this.getIndicatorUrl(indicator);
		const url = this.#buildUrl(indicatorUrl, params);

		const fetchAdapter = this.#getFetchAdapter(indicator);
		const fetch = await fetchAdapter.fetch(url);

		const parseAdapter = this.#getParseAdapter(indicator);
		return parseAdapter.extract(fetch);
	}
}
