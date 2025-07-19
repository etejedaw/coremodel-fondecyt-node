import { z } from "zod";
import { ParseAdapter } from "../adapters/parse-adapter/ParseAdapter";
import { FetchAdapter } from "../adapters/fetch-adapter/FetchAdapter";
import { StorageAdapter } from "../adapters/storage-adapter/StorageAdapter";
import { MapperAdater } from "../adapters/mapper-adapter/MapperAdapter";

export class IndicatorBuilder {
	#config = {} as Indicator;

	setName(name: Indicator["name"]) {
		this.#config.name = name;
		return this;
	}

	setDescription(description: Indicator["description"]) {
		this.#config.description = description;
		return this;
	}

	setUrl(url: Indicator["url"]) {
		this.#config.url = url;
		return this;
	}

	setFrequency(frequency: Indicator["frequency"]) {
		this.#config.frequency = frequency;
		return this;
	}

	setMetadata(metadata: Indicator["metadata"]) {
		this.#config.metadata = metadata;
		return this;
	}

	setFetchAdapter(adapter: Indicator["fetchAdapter"]) {
		this.#config.fetchAdapter = adapter;
		return this;
	}

	setParseAdapter(adapter: Indicator["parseAdapter"]) {
		this.#config.parseAdapter = adapter;
		return this;
	}

	setStorageAdapter(adapter: Indicator["storageAdapter"]) {
		this.#config.storageAdapter = adapter;
		return this;
	}

	setMapperFunction(mapper: Indicator["mapperFunction"]) {
		this.#config.mapperFunction = mapper;
		return this;
	}

	build(): Indicator {
		return {
			...IndicatorSchema.parse(this.#config),
			fetchAdapter: this.#config.fetchAdapter,
			parseAdapter: this.#config.parseAdapter,
			storageAdapter: this.#config.storageAdapter,
			mapperFunction: this.#config.mapperFunction
		};
	}
}

const FREQUENCIES = ["daily", "weekly", "monthly", "year", "once"] as const;

const IndicatorSchema = z.object({
	name: z.string(),
	description: z.string().optional(),
	url: z.string().url(),
	frequency: z.enum(FREQUENCIES),
	metadata: z.record(z.unknown()).optional()
});

type Indicator = z.infer<typeof IndicatorSchema> & {
	fetchAdapter: FetchAdapter;
	parseAdapter: ParseAdapter;
	storageAdapter: StorageAdapter;
	mapperFunction: MapperAdater;
};

export type ModuleConfig = Record<string, Indicator>;
