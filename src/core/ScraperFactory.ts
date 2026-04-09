import { ScrapeBase } from "./ScrapeBase";
import { ScraperNotFoundError, ScraperAlreadyRegisteredError } from "./errors";

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
			throw new ScraperAlreadyRegisteredError(scraperName);
		this.#modules[scraperName] = scraper;
	}

	getIndicators(module: string): string[] {
		const scraper = this.get(module);
		return scraper.getIndicators();
	}

	get(module: string): ScrapeBase {
		const scraper = this.#modules[module];
		if (!scraper) throw new ScraperNotFoundError(module);
		return scraper;
	}

	getAll(): ScrapeBase[] {
		return Object.values(this.#modules);
	}
}
