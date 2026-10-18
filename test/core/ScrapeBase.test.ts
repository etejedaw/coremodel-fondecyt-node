import { ScrapeBase } from "../../src/core/ScrapeBase";
import { IndicatorBuilder } from "../../src/core/IndicatorBuilder";
import { StorageAdapter } from "../../src/core/adapters/storage-adapter/StorageAdapter";
import { FetchAdapter } from "../../src/core/adapters/fetch-adapter/FetchAdapter";
import { ParseAdapter } from "../../src/core/adapters/parse-adapter/ParseAdapter";
import { MapperAdapter } from "../../src/core/adapters/mapper-adapter/MapperAdapter";
import { HashAdapter } from "../../src/core/adapters/hash-adapter/HashAdapter";

class InMemoryStorageAdapter extends StorageAdapter {
	records: Array<Record<string, unknown>> = [];

	async save(data: Array<Record<string, unknown>>) {
		this.records.push(...data);
	}

	async find(indicator: string) {
		return this.records.filter(record => record.indicator === indicator);
	}
}

class TestScraper extends ScrapeBase {
	constructor(storage: StorageAdapter) {
		const indicator = (name: string) =>
			new IndicatorBuilder()
				.setName(name)
				.setUrl("https://example.org")
				.setFetchAdapter({} as FetchAdapter)
				.setParseAdapter({} as ParseAdapter)
				.setMapperAdapter({} as MapperAdapter)
				.setHashAdapter({} as HashAdapter)
				.setStorageAdapter(storage)
				.build();

		super("test-module", {
			first: indicator("First"),
			second: indicator("Second"),
			scheduled: new IndicatorBuilder()
				.setName("Scheduled")
				.setUrl("https://example.org")
				.setFetchAdapter({} as FetchAdapter)
				.setParseAdapter({} as ParseAdapter)
				.setMapperAdapter({} as MapperAdapter)
				.setHashAdapter({} as HashAdapter)
				.setStorageAdapter(storage)
				.setScheduledParams(() => ({ year: "2030" }))
				.build()
		});
	}
}

class PipelineScraper extends ScrapeBase {
	constructor(
		storage: StorageAdapter,
		parsed: Array<Record<string, unknown>>,
		fetch = jest.fn(async () => "payload")
	) {
		super("test-module", {
			pipeline: new IndicatorBuilder()
				.setName("Pipeline")
				.setUrl("https://example.org/{{year}}")
				.setFetchAdapter({ fetch } as FetchAdapter)
				.setParseAdapter({ extract: () => parsed } as ParseAdapter)
				.setMapperAdapter({ map: (item: unknown) => item } as MapperAdapter)
				.setHashAdapter({
					generate: data => `${String(data.year)}-${String(data.name)}`
				} as HashAdapter)
				.setStorageAdapter(storage)
				.build()
		});
	}
}

describe("ScrapeBase.findStoredRecords", () => {
	it("should return only the stored records of the requested indicator", async () => {
		const storage = new InMemoryStorageAdapter();
		await storage.save([
			{ key: "a", indicator: "first" },
			{ key: "b", indicator: "second" }
		]);
		const scraper = new TestScraper(storage);

		await expect(scraper.findStoredRecords("first")).resolves.toEqual([
			{ key: "a", indicator: "first" }
		]);
	});
});

describe("ScrapeBase.getIndicatorScheduledParams", () => {
	it("should return the resolved params of the indicator", () => {
		const scraper = new TestScraper(new InMemoryStorageAdapter());

		expect(scraper.getIndicatorScheduledParams("scheduled")).toEqual({
			year: "2030"
		});
	});

	it("should return an empty object when the indicator has no resolver", () => {
		const scraper = new TestScraper(new InMemoryStorageAdapter());

		expect(scraper.getIndicatorScheduledParams("first")).toEqual({});
	});
});

describe("ScrapeBase.init params", () => {
	it("should add the params to every record before hashing", async () => {
		const storage = new InMemoryStorageAdapter();
		const fetch = jest.fn(async () => "payload");
		const scraper = new PipelineScraper(
			storage,
			[{ name: "a" }, { name: "b" }],
			fetch
		);

		const data = await scraper.init("pipeline", { year: "2024" });

		expect(fetch).toHaveBeenCalledWith("https://example.org/2024");
		expect(data).toEqual([
			{
				year: "2024",
				name: "a",
				indicator: "pipeline",
				module: "test-module",
				key: "2024-a"
			},
			{
				year: "2024",
				name: "b",
				indicator: "pipeline",
				module: "test-module",
				key: "2024-b"
			}
		]);
		expect(storage.records).toEqual(data);
	});

	it("should let the source data win over a param with the same name", async () => {
		const scraper = new PipelineScraper(new InMemoryStorageAdapter(), [
			{ name: "a", year: "1999" }
		]);

		const data = await scraper.init("pipeline", { year: "2024" });

		expect(data[0]).toHaveProperty("year", "1999");
		expect(data[0].key).toBe("1999-a");
	});
});
