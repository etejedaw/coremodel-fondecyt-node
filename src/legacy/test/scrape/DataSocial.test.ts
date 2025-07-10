import { RequestPromise } from "../../../src/libs/htmlExtractor";
import { DataSocial } from "../../../src/helpers/scrape";

describe("Any scrape in DataSocial must have", () => {
	const requestPromise = new RequestPromise();
	const url =
		"https://datasocial.ministeriodesarrollosocial.gob.cl/portalDataSocial/catalogoDimension/47";

	const datasocial = new DataSocial(url, requestPromise);

	it("At least one object in the array", async () => {
		const data = await datasocial.init();
		expect(data.length).toBeGreaterThan(0);
	});

	it("At least one scrape data must exist", async () => {
		const data = await datasocial.init();
		const firstDataElement = data[0];
		const scrapeFirstDataElement = firstDataElement.scrape;
		expect(Array.isArray(scrapeFirstDataElement)).toBe(true);
	});

	it("Data without error format", async () => {
		const data = await datasocial.init();
		const scrapeErrors = data.filter(
			scrapeData => scrapeData.metadata.format === "error"
		);
		expect(scrapeErrors.length).toBe(0);
	});
});
