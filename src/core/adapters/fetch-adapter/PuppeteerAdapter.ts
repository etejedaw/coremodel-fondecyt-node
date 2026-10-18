import puppeteer, { Browser } from "puppeteer";
import { FetchAdapter } from "./FetchAdapter";
import { FetchError } from "../../errors";
import { toFetchError } from "./fetch-errors";

export class PuppeteerAdapter implements FetchAdapter {
	async fetch(url: string): Promise<string> {
		let browser: Browser | undefined;
		try {
			browser = await puppeteer.launch();
			const page = await browser.newPage();
			const response = await page.goto(url);
			if (response && !response.ok()) {
				throw new FetchError(url, `HTTP ${response.status()}`);
			}
			return await page.content();
		} catch (error) {
			throw toFetchError(url, error);
		} finally {
			await browser?.close();
		}
	}
}
