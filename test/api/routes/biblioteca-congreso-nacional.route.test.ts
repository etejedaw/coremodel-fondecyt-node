import { ScraperFactory } from "../../../src/core/ScraperFactory";
import { BibliotecaCongresoNacionalScraper } from "../../../src/modules/biblioteca-congreso-nacional";
import { logger } from "../../../src/core/logger";
import router from "../../../src/api/routes/biblioteca-congreso-nacional.route";
import { startTestServer, TestServer } from "../helpers/test-server";

const factory = ScraperFactory.getInstance();

try {
	factory.register(new BibliotecaCongresoNacionalScraper());
} catch {}

const scraper = factory.get("biblioteca-congreso-nacional");
const validIndicators = scraper.getIndicators();

const povertyRecord = {
	unidadTerritorial: "Valdivia",
	casen2017: 12.5,
	casen2022: 10.3,
	indicator: "valdivia-tasa-pobreza-ingresos",
	module: "biblioteca-congreso-nacional",
	key: "valdivia-biblioteca-congreso-nacional-valdivia-tasa-pobreza-ingresos"
};

describe("Biblioteca Congreso Nacional Route - input validation", () => {
	it("should list the correct indicators", () => {
		const indicators = factory.getIndicators("biblioteca-congreso-nacional");
		expect(indicators).toEqual([
			"valdivia-tasa-pobreza-ingresos",
			"valdivia-organizaciones-comunitarias"
		]);
	});

	it("should reject invalid indicator names", () => {
		const invalid = [
			"santiago-tasa-pobreza-ingresos",
			"organizaciones-comunitarias",
			"",
			"invalid"
		];
		invalid.forEach(indicator => {
			expect(validIndicators.includes(indicator)).toBe(false);
		});
	});

	it("should have valid metadata for each indicator", () => {
		validIndicators.forEach(indicator => {
			expect(scraper.getIndicatorName(indicator)).toBeDefined();
			expect(scraper.getIndicatorUrl(indicator)).toContain("bcn.cl");
		});
	});

	it("should have yearly frequency for BCN indicators", () => {
		validIndicators.forEach(indicator => {
			const frequency = scraper.getIndicatorFrequency(indicator);
			expect(frequency).toBe("0 0 1 1 *");
		});
	});
});

describe("Biblioteca Congreso Nacional Route - HTTP", () => {
	let server: TestServer;

	beforeAll(async () => {
		server = await startTestServer("/biblioteca-congreso-nacional", router);
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
		it("should scrape the poverty rate for the requested year", async () => {
			const init = jest
				.spyOn(scraper, "init")
				.mockResolvedValue([povertyRecord] as never);

			const response = await fetch(
				`${server.baseUrl}/valdivia-tasa-pobreza-ingresos?year=2023`,
				{ method: "POST" }
			);

			expect(response.status).toBe(200);
			expect(await response.json()).toEqual({ data: [povertyRecord] });
			expect(init).toHaveBeenCalledWith("valdivia-tasa-pobreza-ingresos", {
				year: "2023"
			});
		});

		it("should respond 400 when year is missing", async () => {
			const init = jest.spyOn(scraper, "init");

			const response = await fetch(
				`${server.baseUrl}/valdivia-tasa-pobreza-ingresos`,
				{ method: "POST" }
			);

			expect(response.status).toBe(400);
			expect(await response.json()).toEqual({
				error: "year query param is required"
			});
			expect(init).not.toHaveBeenCalled();
		});

		it("should respond 400 when year is empty", async () => {
			const response = await fetch(
				`${server.baseUrl}/valdivia-tasa-pobreza-ingresos?year=`,
				{ method: "POST" }
			);

			expect(response.status).toBe(400);
			expect(await response.json()).toEqual({
				error: "year query param is required"
			});
		});

		it.each(["23", "20234", "abcd", "2023-01"])(
			"should respond 400 when year is %s",
			async year => {
				const init = jest.spyOn(scraper, "init");

				const response = await fetch(
					`${server.baseUrl}/valdivia-tasa-pobreza-ingresos?year=${year}`,
					{ method: "POST" }
				);

				expect(response.status).toBe(400);
				expect(await response.json()).toEqual({
					error: "year query param must be a 4-digit year"
				});
				expect(init).not.toHaveBeenCalled();
			}
		);

		it("should respond 400 when year is repeated", async () => {
			const response = await fetch(
				`${server.baseUrl}/valdivia-tasa-pobreza-ingresos?year=2022&year=2023`,
				{ method: "POST" }
			);

			expect(response.status).toBe(400);
			expect(await response.json()).toEqual({
				error: "year query param must be a 4-digit year"
			});
		});

		it("should scrape community organizations without requiring year", async () => {
			const init = jest.spyOn(scraper, "init").mockResolvedValue([] as never);

			const response = await fetch(
				`${server.baseUrl}/valdivia-organizaciones-comunitarias`,
				{ method: "POST" }
			);

			expect(response.status).toBe(200);
			expect(await response.json()).toEqual({ data: [] });
			expect(init).toHaveBeenCalledWith(
				"valdivia-organizaciones-comunitarias",
				{}
			);
		});

		it("should respond 404 for an unknown indicator before validating year", async () => {
			const response = await fetch(
				`${server.baseUrl}/santiago-tasa-pobreza-ingresos`,
				{ method: "POST" }
			);

			expect(response.status).toBe(404);
			expect(await response.json()).toEqual({
				error: "Indicator santiago-tasa-pobreza-ingresos not found"
			});
		});
	});

	describe("GET /:indicator", () => {
		it("should read the stored records without scraping or requiring year", async () => {
			const init = jest.spyOn(scraper, "init");
			const findStoredRecords = jest
				.spyOn(scraper, "findStoredRecords")
				.mockResolvedValue([povertyRecord]);

			const response = await fetch(
				`${server.baseUrl}/valdivia-tasa-pobreza-ingresos`
			);

			expect(response.status).toBe(200);
			expect(await response.json()).toEqual({ data: [povertyRecord] });
			expect(findStoredRecords).toHaveBeenCalledWith(
				"valdivia-tasa-pobreza-ingresos"
			);
			expect(init).not.toHaveBeenCalled();
		});

		it("should respond with an empty array when nothing is stored yet", async () => {
			jest.spyOn(scraper, "findStoredRecords").mockResolvedValue([]);

			const response = await fetch(
				`${server.baseUrl}/valdivia-organizaciones-comunitarias`
			);

			expect(response.status).toBe(200);
			expect(await response.json()).toEqual({ data: [] });
		});

		it("should respond 404 for an unknown indicator", async () => {
			const response = await fetch(`${server.baseUrl}/invalid`);

			expect(response.status).toBe(404);
			expect(await response.json()).toEqual({
				error: "Indicator invalid not found"
			});
		});
	});
});
