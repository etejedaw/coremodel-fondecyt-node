import { Router } from "express";
import { ScraperFactory } from "../../core/ScraperFactory";

const router = Router();

router.get("/", (req, res) => {
	const scrapeFactory = ScraperFactory.getInstance();
	const indicators = scrapeFactory.getIndicators(
		"biblioteca-congreso-nacional"
	);
	res.json({ indicators });
});

router.get("/:indicator", async (req, res) => {
	const { indicator } = req.params;
	const year = String(req.query.year);

	const scrapeFactory = ScraperFactory.getInstance();
	const scraper = scrapeFactory.get("biblioteca-congreso-nacional");

	const data = await scraper.init(indicator, { year });

	return res.json({ data }).status(200);
});

export default router;
