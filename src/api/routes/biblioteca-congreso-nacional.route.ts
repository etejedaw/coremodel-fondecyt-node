import { Router, Request, Response, NextFunction } from "express";
import { ScraperFactory } from "../../core/ScraperFactory";
import { ScrapeBase } from "../../core/ScrapeBase";
import { InvalidQueryParamError } from "../../core/errors";

const MODULE = "biblioteca-congreso-nacional";
const YEAR_PLACEHOLDER = "{{year}}";
const FOUR_DIGIT_YEAR = /^\d{4}$/;
const router = Router();

function parseYear(year: unknown): string {
	if (year === undefined || year === "") {
		throw new InvalidQueryParamError("year", "is required");
	}
	if (typeof year !== "string" || !FOUR_DIGIT_YEAR.test(year)) {
		throw new InvalidQueryParamError("year", "must be a 4-digit year", year);
	}
	return year;
}

function buildScrapeParams(
	scraper: ScrapeBase,
	indicator: string,
	query: Request["query"]
): Record<string, string> {
	const requiresYear = scraper
		.getIndicatorUrl(indicator)
		.includes(YEAR_PLACEHOLDER);
	return requiresYear ? { year: parseYear(query.year) } : {};
}

router.get("/", (req, res) => {
	const scrapeFactory = ScraperFactory.getInstance();
	const indicators = scrapeFactory.getIndicators(MODULE);
	res.json({ indicators });
});

router.get(
	"/:indicator",
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { indicator } = req.params;
			const scrapeFactory = ScraperFactory.getInstance();
			const scraper = scrapeFactory.get(MODULE);

			if (!scraper.getIndicators().includes(indicator)) {
				return res
					.status(404)
					.json({ error: `Indicator ${indicator} not found` });
			}

			const data = await scraper.findStoredRecords(indicator);
			return res.json({ data });
		} catch (err) {
			next(err);
		}
	}
);

router.post(
	"/:indicator",
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { indicator } = req.params;
			const scrapeFactory = ScraperFactory.getInstance();
			const scraper = scrapeFactory.get(MODULE);

			if (!scraper.getIndicators().includes(indicator)) {
				return res
					.status(404)
					.json({ error: `Indicator ${indicator} not found` });
			}

			const params = buildScrapeParams(scraper, indicator, req.query);
			const data = await scraper.init(indicator, params);
			return res.json({ data });
		} catch (err) {
			next(err);
		}
	}
);

export default router;
