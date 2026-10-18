import { schedule } from "node-cron";
import { CronRegistry } from "../../src/core/CronRegistry";
import { ScraperFactory } from "../../src/core/ScraperFactory";
import { ScrapeBase } from "../../src/core/ScrapeBase";
import { FetchError, ParseError } from "../../src/core/errors";
import { logger } from "../../src/core/logger";

jest.mock("node-cron", () => ({ schedule: jest.fn() }));
jest.mock("../../src/core/logger", () => ({ logger: { error: jest.fn() } }));

const scheduleMock = schedule as jest.Mock;
const loggerErrorMock = logger.error as jest.Mock;

function buildFactory(scraper: Partial<ScrapeBase>) {
	return { getAll: () => [scraper] } as unknown as ScraperFactory;
}

function buildScraper(
	frequency: string,
	candidates: Array<Record<string, string>>,
	init: jest.Mock = jest.fn(async () => [])
) {
	return {
		getName: () => "test-module",
		getIndicators: () => ["indicator"],
		getIndicatorFrequency: () => frequency,
		getIndicatorScheduledParams: jest.fn(() => candidates),
		init
	};
}

async function runScheduledTask() {
	await scheduleMock.mock.calls[0][1]();
}

describe("CronRegistry.start", () => {
	beforeEach(() => {
		scheduleMock.mockReset();
		scheduleMock.mockReturnValue({ stop: jest.fn() });
		loggerErrorMock.mockReset();
	});

	it("should run init with the params resolved at execution time", async () => {
		const scraper = buildScraper("0 0 1 1 *", [{ year: "2026" }]);
		CronRegistry.getInstance().start(buildFactory(scraper));

		expect(scheduleMock).toHaveBeenCalledWith(
			"0 0 1 1 *",
			expect.any(Function)
		);
		expect(scraper.getIndicatorScheduledParams).not.toHaveBeenCalled();

		await runScheduledTask();

		expect(scraper.init).toHaveBeenCalledWith("indicator", { year: "2026" });
	});

	it("should run init with an empty object when there is no resolver", async () => {
		const scraper = buildScraper("0 0 1 1 *", [{}]);
		CronRegistry.getInstance().start(buildFactory(scraper));

		await runScheduledTask();

		expect(scraper.init).toHaveBeenCalledWith("indicator", {});
	});

	it("should try the next candidate when the source has no data for the current one", async () => {
		const init = jest
			.fn()
			.mockRejectedValueOnce(new ParseError("indicator", "url-2026"))
			.mockResolvedValueOnce([]);
		const scraper = buildScraper(
			"0 0 1 1 *",
			[{ year: "2026" }, { year: "2025" }, { year: "2024" }],
			init
		);
		CronRegistry.getInstance().start(buildFactory(scraper));

		await runScheduledTask();

		expect(init).toHaveBeenCalledTimes(2);
		expect(init).toHaveBeenNthCalledWith(2, "indicator", { year: "2025" });
		expect(loggerErrorMock).not.toHaveBeenCalled();
	});

	it("should stop at the first error that is not a parse error", async () => {
		const init = jest
			.fn()
			.mockRejectedValueOnce(new FetchError("url-2026", "timeout"));
		const scraper = buildScraper(
			"0 0 1 1 *",
			[{ year: "2026" }, { year: "2025" }],
			init
		);
		CronRegistry.getInstance().start(buildFactory(scraper));

		await runScheduledTask();

		expect(init).toHaveBeenCalledTimes(1);
		expect(loggerErrorMock).toHaveBeenCalledTimes(1);
	});

	it("should log the failure when no candidate has data", async () => {
		const init = jest.fn(async () => {
			throw new ParseError("indicator", "url");
		});
		const scraper = buildScraper(
			"0 0 1 1 *",
			[{ year: "2026" }, { year: "2025" }],
			init
		);
		CronRegistry.getInstance().start(buildFactory(scraper));

		await runScheduledTask();

		expect(init).toHaveBeenCalledTimes(2);
		expect(loggerErrorMock).toHaveBeenCalledWith(
			expect.objectContaining({
				context: expect.objectContaining({ indicator: "indicator" })
			}),
			"Cron execution failed for indicator"
		);
	});

	it("should not schedule indicators with an empty frequency", () => {
		const scraper = buildScraper("", [{}]);
		CronRegistry.getInstance().start(buildFactory(scraper));

		expect(scheduleMock).not.toHaveBeenCalled();
	});
});
