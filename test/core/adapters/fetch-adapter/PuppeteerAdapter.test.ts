import puppeteer from "puppeteer";
import { PuppeteerAdapter } from "../../../../src/core/adapters/fetch-adapter/PuppeteerAdapter";
import { FetchError } from "../../../../src/core/errors";

jest.mock("puppeteer", () => ({
	__esModule: true,
	default: { launch: jest.fn() }
}));

const URL = "https://example.org/";
const mockedLaunch = puppeteer.launch as jest.Mock;

function mockBrowser(goto: jest.Mock) {
	const page = { goto, content: jest.fn().mockResolvedValue("<html></html>") };
	const browser = {
		newPage: jest.fn().mockResolvedValue(page),
		close: jest.fn().mockResolvedValue(undefined)
	};
	mockedLaunch.mockResolvedValue(browser);
	return browser;
}

function pageResponse(status: number) {
	return { ok: () => status >= 200 && status < 300, status: () => status };
}

describe("PuppeteerAdapter", () => {
	const adapter = new PuppeteerAdapter();

	afterEach(() => {
		mockedLaunch.mockReset();
	});

	it("should return the rendered content and close the browser", async () => {
		const browser = mockBrowser(jest.fn().mockResolvedValue(pageResponse(200)));

		await expect(adapter.fetch(URL)).resolves.toBe("<html></html>");
		expect(browser.close).toHaveBeenCalledTimes(1);
	});

	it("should throw FetchError and close the browser when navigation fails", async () => {
		const browser = mockBrowser(
			jest.fn().mockRejectedValue(new Error("net::ERR_NAME_NOT_RESOLVED"))
		);

		await expect(adapter.fetch(URL)).rejects.toMatchObject({
			constructor: FetchError,
			context: { url: URL, cause: "net::ERR_NAME_NOT_RESOLVED" }
		});
		expect(browser.close).toHaveBeenCalledTimes(1);
	});

	it("should throw FetchError and close the browser when the page is not successful", async () => {
		const browser = mockBrowser(jest.fn().mockResolvedValue(pageResponse(503)));

		await expect(adapter.fetch(URL)).rejects.toMatchObject({
			constructor: FetchError,
			context: { url: URL, cause: "HTTP 503" }
		});
		expect(browser.close).toHaveBeenCalledTimes(1);
	});

	it("should throw FetchError when the browser cannot be launched", async () => {
		mockedLaunch.mockRejectedValue(new Error("Failed to launch the browser"));

		await expect(adapter.fetch(URL)).rejects.toBeInstanceOf(FetchError);
	});
});
