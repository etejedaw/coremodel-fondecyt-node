import { schedule, ScheduledTask } from "node-cron";
import { ScraperFactory } from "./ScraperFactory";
import { CronExecutionError } from "./errors";
import { logger } from "./logger";

export class CronRegistry {
	static #instance: CronRegistry;
	#tasks = new Map<string, ScheduledTask>();

	static getInstance(): CronRegistry {
		if (!this.#instance) this.#instance = new CronRegistry();
		return this.#instance;
	}

	start(factory: ScraperFactory) {
		factory
			.getAll()
			.flatMap(scraper =>
				scraper.getIndicators().map(indicator => ({
					scraper,
					indicator,
					frequency: scraper.getIndicatorFrequency(indicator)
				}))
			)
			.filter(job => job.frequency !== "")
			.forEach(({ scraper, indicator, frequency }) => {
				const key = `${scraper.getName()}:${indicator}`;
				const task = schedule(frequency, async () => {
					try {
						await scraper.init(indicator);
					} catch (error) {
						const cronError = new CronExecutionError(indicator, error);
						logger.error({ context: cronError.context }, cronError.message);
					}
				});
				this.#tasks.set(key, task);
			});
	}

	stopTask(module: string, indicator: string) {
		const key = `${module}:${indicator}`;
		const task = this.#tasks.get(key);
		if (!task) return false;
		void task.stop();
		this.#tasks.delete(key);
		return true;
	}

	async stop() {
		// eslint-disable-next-line @typescript-eslint/promise-function-async
		const promises = [...this.#tasks.values()].map(task => task.stop());
		await Promise.all(promises);
		this.#tasks.clear();
	}
}
