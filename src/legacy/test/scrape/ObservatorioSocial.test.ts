import { RequestPromise } from "../../../src/libs/htmlExtractor";
import { ObservatorioSocial } from "../../../src/helpers/scrape";

describe("Any scrape in ObservatorioSocialOld must have", () => {
	const requestPromise = new RequestPromise();
	const url =
		"https://observatorio.ministeriodesarrollosocial.gob.cl/encuesta-casen-2017";

	const observatorioSocial = new ObservatorioSocial(url, requestPromise);

	it("At least one array of codes to find the data to download", async () => {
		const codes = await observatorioSocial.getAll();
		expect(codes.length).toBeGreaterThan(0);
	});

	it("At least one array of codes with their own data structure", async () => {
		const codes = await observatorioSocial.getAll();

		codes.forEach((codeScrape: any) => {
			expect(codeScrape).toHaveProperty("title");
			expect(codeScrape).toHaveProperty("code");
			expect(codeScrape).toHaveProperty("format");
		});
	});

	it("At least one object in the array using 'prevision-social-casen-2017' code", async () => {
		const code = "prevision-social-casen-2017";
		const data = await observatorioSocial.init(code);

		data.forEach((urlScrape: any) => {
			const scrape = urlScrape.scrape;

			if (!scrape) throw new Error("Empty scrape variable");

			scrape.forEach((scrapeData: any) => {
				expect(scrapeData).toHaveProperty("unknown");
			});
		});
	});
});
