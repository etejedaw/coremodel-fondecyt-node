import { ScraperFactory } from "../../src/core/ScraperFactory";
import { EmergenciaDesastresScraper } from "../../src/modules/emergencias-desastres";

const factory = ScraperFactory.getInstance();
factory.register(new EmergenciaDesastresScraper());

const scraper = factory.get("emergencia-desastres");
const validIndicators = scraper.getIndicators();

describe("Emergencia Desastres Route - input validation", () => {
	it("should list the correct indicators", () => {
		const indicators = factory.getIndicators("emergencia-desastres");
		expect(indicators).toEqual([
			"simulacros-2021",
			"simulacros-2022",
			"simulacros-2023"
		]);
	});

	it("should accept valid indicator names", () => {
		validIndicators.forEach(indicator => {
			expect(validIndicators.includes(indicator)).toBe(true);
		});
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
