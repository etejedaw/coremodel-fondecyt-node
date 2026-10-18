import { schedule } from "node-cron";
import { CronRegistry } from "../../src/core/CronRegistry";
import { ScraperFactory } from "../../src/core/ScraperFactory";
import { ScrapeBase } from "../../src/core/ScrapeBase";

jest.mock("node-cron", () => ({ schedule: jest.fn() }));
jest.mock("../../src/core/logger", () => ({ logger: { error: jest.fn() } }));

const scheduleMock = schedule as jest.Mock;

function buildFactory(scraper: Partial<ScrapeBase>) {
	return { getAll: () => [scraper] } as unknown as ScraperFactory;
}

function buildScraper(frequency: string, params: Record<string, string>) {
	return {
		getName: () => "test-module",
		getIndicators: () => ["indicator"],
		getIndicatorFrequency: () => frequency,
		getIndicatorScheduledParams: jest.fn(() => params),
		init: jest.fn(async () => [])
	};
}

describe("CronRegistry.start", () => {
	beforeEach(() => {
		scheduleMock.mockReset();
		scheduleMock.mockReturnValue({ stop: jest.fn() });
	});

	it("should run init with the params resolved at execution time", async () => {
		const scraper = buildScraper("0 0 1 1 *", { year: "2026" });
		CronRegistry.getInstance().start(buildFactory(scraper));

		expect(scheduleMock).toHaveBeenCalledWith(
			"0 0 1 1 *",
			expect.any(Function)
		);
		expect(scraper.getIndicatorScheduledParams).not.toHaveBeenCalled();

		await scheduleMock.mock.calls[0][1]();

		expect(scraper.init).toHaveBeenCalledWith("indicator", { year: "2026" });
	});

	it("should run init with an empty object when there is no resolver", async () => {
		const scraper = buildScraper("0 0 1 1 *", {});
		CronRegistry.getInstance().start(buildFactory(scraper));

		await scheduleMock.mock.calls[0][1]();

		expect(scraper.init).toHaveBeenCalledWith("indicator", {});
	});

	it("should not schedule indicators with an empty frequency", () => {
		const scraper = buildScraper("", {});
		CronRegistry.getInstance().start(buildFactory(scraper));

		expect(scheduleMock).not.toHaveBeenCalled();
	});
});
