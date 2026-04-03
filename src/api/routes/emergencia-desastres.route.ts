import { Router } from "express";
import { ScraperFactory } from "../../core/ScraperFactory";
import { BaseError } from "../../core/errors";
import { logger } from "../../core/logger";

const MODULE = "emergencia-desastres";
const router = Router();

router.get("/", (req, res) => {
	const scrapeFactory = ScraperFactory.getInstance();
	const indicators = scrapeFactory.getIndicators(MODULE);
	res.json({ indicators });
});

router.get("/:indicator/result", async (req, res) => {
	try {
		const { indicator } = req.params;
		const scrapeFactory = ScraperFactory.getInstance();
		const scraper = scrapeFactory.get(MODULE);

		if (!scraper.getIndicators().includes(indicator)) {
			return res.status(404).json({ error: `Indicator ${indicator} not found` });
		}

		const calculator = scraper.getCalculatorAdapter(indicator);
		if (!calculator) {
			return res.status(404).json({ error: `No calculator for ${indicator}` });
		}

		const result = await calculator.find(indicator, MODULE);
		if (!result) {
			return res.status(404).json({ error: `No results yet for ${indicator}` });
		}

		return res.json({ result });
	} catch (error) {
		if (error instanceof BaseError) {
			logger.error({ context: error.context }, error.message);
			return res.status(400).json({ error: error.message });
		}
		logger.error(error);
		return res.status(500).json({ error: "Internal server error" });
	}
});

router.get("/:indicator", async (req, res) => {
	try {
		const { indicator } = req.params;
		const scrapeFactory = ScraperFactory.getInstance();
		const scraper = scrapeFactory.get(MODULE);

		if (!scraper.getIndicators().includes(indicator)) {
			return res.status(404).json({ error: `Indicator ${indicator} not found` });
		}

		const data = await scraper.init(indicator);
		return res.json({ data });
	} catch (error) {
		if (error instanceof BaseError) {
			logger.error({ context: error.context }, error.message);
			return res.status(400).json({ error: error.message });
		}
		logger.error(error);
		return res.status(500).json({ error: "Internal server error" });
	}
});

export default router;
