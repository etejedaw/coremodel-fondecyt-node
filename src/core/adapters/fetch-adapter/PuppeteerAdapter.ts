import puppeteer from "puppeteer";
import { FetchAdapter } from "./FetchAdapter";

export class PuppeteerAdapter implements FetchAdapter {
	async fetch(url: string): Promise<string> {
		const browser = await puppeteer.launch();
		const page = await browser.newPage();
		await page.goto(url);
		const content = await page.content();
		await browser.close();
		return content;
	}
}
