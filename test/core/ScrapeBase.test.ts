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
			second: indicator("Second")
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
