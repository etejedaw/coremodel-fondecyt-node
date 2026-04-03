import { Router } from "express";
import emergenciaDesastres from "./emergencia-desastres.route";
import bibliotecaCongresoNacional from "./biblioteca-congreso-nacional.route";
import { ScraperFactory } from "../../core/ScraperFactory";

const router = Router();

router.get("/", (req, res) => {
	const factory = ScraperFactory.getInstance();
	const modules = factory.getAll().map(scraper => {
		const moduleName = scraper.getName();
		const indicators = scraper.getIndicators().map(key => ({
			key,
			name: scraper.getIndicatorName(key),
			url: scraper.getIndicatorUrl(key),
			frequency: scraper.getIndicatorFrequency(key)
		}));
		return { module: moduleName, indicators };
	});
	res.json({ modules });
});

router.use("/emergencia-desastres", emergenciaDesastres);
router.use("/biblioteca-congreso-nacional", bibliotecaCongresoNacional);

export default router;
