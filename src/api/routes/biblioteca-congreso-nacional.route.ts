import { Router, Request, Response, NextFunction } from "express";
import { ScraperFactory } from "../../core/ScraperFactory";

const MODULE = "biblioteca-congreso-nacional";
const router = Router();

router.get("/", (req, res) => {
	const scrapeFactory = ScraperFactory.getInstance();
	const indicators = scrapeFactory.getIndicators(MODULE);
	res.json({ indicators });
});

router.get("/:indicator", async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { indicator } = req.params;
		const year = String(req.query.year);

		const scrapeFactory = ScraperFactory.getInstance();
		const scraper = scrapeFactory.get(MODULE);

		if (!scraper.getIndicators().includes(indicator)) {
			return res.status(404).json({ error: `Indicator ${indicator} not found` });
		}

		const data = await scraper.init(indicator, { year });
		return res.json({ data });
	} catch (err) {
		next(err);
	}
});

export default router;
