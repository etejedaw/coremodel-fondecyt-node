import { schedule, ScheduledTask } from "node-cron";
import { ScraperFactory } from "./ScraperFactory";

export class CronRegistry {
	#tasks: ScheduledTask[] = [];

	start(factory: ScraperFactory) {
		this.#tasks = factory
			.getAll()
			.flatMap(scraper =>
				scraper.getIndicators().map(indicator => ({
					scraper,
					indicator,
					frequency: scraper.getIndicatorFrequency(indicator)
				}))
			)
			.filter(job => job.frequency !== "")
			.map(({ scraper, indicator, frequency }) =>
				schedule(frequency, async () => {
					try {
						await scraper.init(indicator);
					} catch (error) {
						console.error(
							`[CronRegistry] Error executing ${indicator}:`,
							error
						);
					}
				})
			);
	}

	async stop() {
		// eslint-disable-next-line @typescript-eslint/promise-function-async
		const promises = this.#tasks.map(task => task.stop());
		await Promise.all(promises);
		this.#tasks = [];
	}
}
