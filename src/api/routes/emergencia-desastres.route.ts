import { Router, Request, Response, NextFunction } from "express";
import { ScraperFactory } from "../../core/ScraperFactory";

const MODULE = "emergencia-desastres";
const router = Router();

router.get("/", (req, res) => {
	const scrapeFactory = ScraperFactory.getInstance();
	const indicators = scrapeFactory.getIndicators(MODULE);
	res.json({ indicators });
});

router.get("/:indicator/result", async (req: Request, res: Response, next: NextFunction) => {
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
	} catch (err) {
		next(err);
	}
});

router.get("/:indicator", async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { indicator } = req.params;
		const scrapeFactory = ScraperFactory.getInstance();
		const scraper = scrapeFactory.get(MODULE);

		if (!scraper.getIndicators().includes(indicator)) {
			return res.status(404).json({ error: `Indicator ${indicator} not found` });
		}

		const data = await scraper.init(indicator);
		return res.json({ data });
	} catch (err) {
		next(err);
	}
});

export default router;
