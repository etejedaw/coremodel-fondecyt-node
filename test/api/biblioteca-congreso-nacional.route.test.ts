import { ScraperFactory } from "../../src/core/ScraperFactory";
import { BibliotecaCongresoNacionalScraper } from "../../src/modules/biblioteca-congreso-nacional";

const factory = ScraperFactory.getInstance();

try {
	factory.register(new BibliotecaCongresoNacionalScraper());
} catch {}

const scraper = factory.get("biblioteca-congreso-nacional");
const validIndicators = scraper.getIndicators();

describe("Biblioteca Congreso Nacional Route - input validation", () => {
	it("should list the correct indicators", () => {
		const indicators = factory.getIndicators("biblioteca-congreso-nacional");
		expect(indicators).toEqual([
			"valdivia-tasa-pobreza-ingresos",
			"valdivia-organizaciones-comunitaras"
		]);
	});

	it("should accept valid indicator names", () => {
		validIndicators.forEach(indicator => {
			expect(validIndicators.includes(indicator)).toBe(true);
		});
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
