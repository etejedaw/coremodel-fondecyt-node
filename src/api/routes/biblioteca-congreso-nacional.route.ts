import { Router } from "express";
import { ScraperFactory } from "../../core/ScraperFactory";
import { BaseError } from "../../core/errors";
import { logger } from "../../core/logger";

const MODULE = "biblioteca-congreso-nacional";
const router = Router();

router.get("/", (req, res) => {
	const scrapeFactory = ScraperFactory.getInstance();
	const indicators = scrapeFactory.getIndicators(MODULE);
	res.json({ indicators });
});

router.get("/:indicator", async (req, res) => {
	try {
		const { indicator } = req.params;
		const year = String(req.query.year);

		const scrapeFactory = ScraperFactory.getInstance();
		const scraper = scrapeFactory.get(MODULE);

		if (!scraper.getIndicators().includes(indicator)) {
			return res.status(404).json({ error: `Indicator ${indicator} not found` });
		}

		const result = await scraper.init(indicator, { year });
		return res.json(result);
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
