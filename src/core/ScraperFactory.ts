import { ScrapeBase } from "./ScrapeBase";

export class ScraperFactory {
	#modules: Record<string, ScrapeBase> = {};
	static #instance: ScraperFactory;

	static getInstance(): ScraperFactory {
		if (!this.#instance) this.#instance = new ScraperFactory();
		return this.#instance;
	}

	register(scraper: ScrapeBase) {
		const scraperName = scraper.getName();
		if (this.#modules[scraperName])
			throw new Error(`Scraper ${scraperName} is already registered`);
		this.#modules[scraperName] = scraper;
	}

	getIndicators(module: string): string[] {
		const scraper = this.get(module);
		return scraper.getIndicators();
	}

	get(module: string): ScrapeBase {
		const scraper = this.#modules[module];
		if (!scraper) throw new Error(`Scraper ${module} not found`);
		return scraper;
	}
}
