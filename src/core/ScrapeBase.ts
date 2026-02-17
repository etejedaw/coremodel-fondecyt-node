import { ModuleConfig } from "./IndicatorBuilder";
import { AdapterNotFoundError, ParseError } from "./errors";

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

	getIndicatorFrequency(indicator: string) {
		return this.#moduleConfig[indicator].frequency;
	}

	#getFetchAdapter(indicator: string) {
		const adapter = this.#moduleConfig[indicator].fetchAdapter;
		if (!adapter) throw new AdapterNotFoundError("FetchAdapter", indicator);
		return adapter;
	}

	#getParseAdapter(indicator: string) {
		const adapter = this.#moduleConfig[indicator].parseAdapter;
		if (!adapter) throw new AdapterNotFoundError("ParseAdapter", indicator);
		return adapter;
	}

	#getStorageAdapter(indicator: string) {
		const adapter = this.#moduleConfig[indicator].storageAdapter;
		if (!adapter)
			throw new AdapterNotFoundError("StorageAdapter", indicator);
		return adapter;
	}

	#getMapperAdapter(indicator: string) {
		const adapter = this.#moduleConfig[indicator].mapperAdapter.map;
		if (!adapter)
			throw new AdapterNotFoundError("MapperAdapter", indicator);
		return adapter;
	}

	#getHashAdapter(indicator: string) {
		const adapter = this.#moduleConfig[indicator].hashAdapter;
		if (!adapter) throw new AdapterNotFoundError("HashAdapter", indicator);
		return adapter;
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
		const parse = parseAdapter.extract(fetch);
		if (!parse.length) throw new ParseError(indicator, url);

		const hasher = this.#getHashAdapter(indicator);
		const mapperAdapter = this.#getMapperAdapter(indicator);

		const data = parse
			.map(mapperAdapter)
			.map(data => ({ ...data, indicator, module: this.getName() }))
			.map(data => ({ ...data, key: hasher.generate(data) }));

		const storageAdapter = this.#getStorageAdapter(indicator);
		await storageAdapter.save(data);

		return data;
	}
}
