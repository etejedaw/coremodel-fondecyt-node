import { ScraperFactory } from "../../../src/core/ScraperFactory";
import { EmergenciaDesastresScraper } from "../../../src/modules/emergencias-desastres";
import { FetchError, ParseError } from "../../../src/core/errors";
import { logger } from "../../../src/core/logger";
import router from "../../../src/api/routes/emergencia-desastres.route";
import { startTestServer, TestServer } from "../helpers/test-server";

const factory = ScraperFactory.getInstance();
factory.register(new EmergenciaDesastresScraper());

const scraper = factory.get("emergencia-desastres");
const validIndicators = scraper.getIndicators();

const storedRecord = {
	date: "2021-05-27T04:00:00.000Z",
	place: "Sismo Tsunami - Sector Educación",
	region: "Arica y Parinacota",
	regionSource: "Arica",
	indicator: "simulacros-2021",
	module: "emergencia-desastres",
	key: "2021-05-27-arica-y-parinacota"
};

describe("Emergencia Desastres Route - input validation", () => {
	it("should list the correct indicators", () => {
		const indicators = factory.getIndicators("emergencia-desastres");
		expect(indicators).toEqual([
			"simulacros-2021",
			"simulacros-2022",
			"simulacros-2023"
		]);
	});

	it("should reject invalid indicator names", () => {
		const invalid = [
			"simulacros-2024",
			"simulacros-2020",
			"",
			"invalid",
			"SIMULACROS-2021"
		];
		invalid.forEach(indicator => {
			expect(validIndicators.includes(indicator)).toBe(false);
		});
	});

	it("should have valid metadata for each indicator", () => {
		validIndicators.forEach(indicator => {
			expect(scraper.getIndicatorName(indicator)).toBeDefined();
			expect(scraper.getIndicatorUrl(indicator)).toContain("http");
		});
	});
});

describe("Emergencia Desastres Route - HTTP", () => {
	let server: TestServer;

	beforeAll(async () => {
		server = await startTestServer("/emergencia-desastres", router);
	});

	afterAll(async () => {
		await server.close();
	});

	beforeEach(() => {
		jest.spyOn(logger, "error").mockImplementation(() => undefined);
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe("POST /:indicator", () => {
		it("should run the scraper and respond with the extracted data", async () => {
			const init = jest
				.spyOn(scraper, "init")
				.mockResolvedValue([storedRecord] as never);

			const response = await fetch(`${server.baseUrl}/simulacros-2021`, {
				method: "POST"
			});

			expect(response.status).toBe(200);
			expect(await response.json()).toEqual({ data: [storedRecord] });
			expect(init).toHaveBeenCalledWith("simulacros-2021");
		});

		it("should respond 404 for an unknown indicator without scraping", async () => {
			const init = jest.spyOn(scraper, "init");

			const response = await fetch(`${server.baseUrl}/simulacros-2024`, {
				method: "POST"
			});

			expect(response.status).toBe(404);
			expect(await response.json()).toEqual({
				error: "Indicator simulacros-2024 not found"
			});
			expect(init).not.toHaveBeenCalled();
		});

		it("should respond 400 when the source has no data", async () => {
			jest
				.spyOn(scraper, "init")
				.mockRejectedValue(
					new ParseError("simulacros-2021", "https://example.org")
				);

			const response = await fetch(`${server.baseUrl}/simulacros-2021`, {
				method: "POST"
			});

			expect(response.status).toBe(400);
			expect(await response.json()).toEqual({
				error: "Cannot extract data from source"
			});
		});

		it("should respond 502 when the source cannot be fetched", async () => {
			jest
				.spyOn(scraper, "init")
				.mockRejectedValue(new FetchError("https://example.org", "HTTP 503"));

			const response = await fetch(`${server.baseUrl}/simulacros-2021`, {
				method: "POST"
			});

			expect(response.status).toBe(502);
			expect(await response.json()).toEqual({
				error: "Fetch failed for https://example.org"
			});
		});
	});

	describe("GET /:indicator", () => {
		it("should read the stored records without scraping", async () => {
			const init = jest.spyOn(scraper, "init");
			const findStoredRecords = jest
				.spyOn(scraper, "findStoredRecords")
				.mockResolvedValue([storedRecord]);

			const response = await fetch(`${server.baseUrl}/simulacros-2021`);

			expect(response.status).toBe(200);
			expect(await response.json()).toEqual({ data: [storedRecord] });
			expect(findStoredRecords).toHaveBeenCalledWith("simulacros-2021");
			expect(init).not.toHaveBeenCalled();
		});

		it("should respond with an empty array when nothing is stored yet", async () => {
			jest.spyOn(scraper, "findStoredRecords").mockResolvedValue([]);

			const response = await fetch(`${server.baseUrl}/simulacros-2022`);

			expect(response.status).toBe(200);
			expect(await response.json()).toEqual({ data: [] });
		});

		it("should respond 404 for an unknown indicator", async () => {
			const findStoredRecords = jest.spyOn(scraper, "findStoredRecords");

			const response = await fetch(`${server.baseUrl}/simulacros-2020`);

			expect(response.status).toBe(404);
			expect(await response.json()).toEqual({
				error: "Indicator simulacros-2020 not found"
			});
			expect(findStoredRecords).not.toHaveBeenCalled();
		});
	});

	describe("GET /", () => {
		it("should list the module indicators", async () => {
			const response = await fetch(server.baseUrl);

			expect(response.status).toBe(200);
			expect(await response.json()).toEqual({ indicators: validIndicators });
		});
	});
});
