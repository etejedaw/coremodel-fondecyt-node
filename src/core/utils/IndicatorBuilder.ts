import { z } from "zod";
import { ParseAdapter } from "../adapters/parse-adapter/ParseAdapter";
import { FetchAdapter } from "../adapters/fetch-adapter/FetchAdapter";
import { StorageAdapter } from "../adapters/storage-adapter/StorageAdapter";
import { MapperAdater } from "../adapters/mapper-adapter/MapperAdapter";
import { HashAdapter } from "../adapters/hash-adapter/HashAdapter";

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

	setMapperAdapter(mapper: Indicator["mapperAdapter"]) {
		this.#config.mapperAdapter = mapper;
		return this;
	}

	setHashAdapter(hash: Indicator["hashAdapter"]) {
		this.#config.hashAdapter = hash;
		return this;
	}

	build(): Indicator {
		return {
			...IndicatorSchema.parse(this.#config),
			fetchAdapter: this.#config.fetchAdapter,
			parseAdapter: this.#config.parseAdapter,
			storageAdapter: this.#config.storageAdapter,
			mapperAdapter: this.#config.mapperAdapter,
			hashAdapter: this.#config.hashAdapter
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
	mapperAdapter: MapperAdater;
	hashAdapter: HashAdapter;
};

export type ModuleConfig = Record<string, Indicator>;
