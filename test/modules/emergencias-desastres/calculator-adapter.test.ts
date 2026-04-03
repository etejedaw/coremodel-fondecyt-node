import { TsunamiDrillsCalculatorAdapter } from "../../../src/modules/emergencias-desastres/calculator-adapter";

const calculator = new TsunamiDrillsCalculatorAdapter();

describe("TsunamiDrillsCalculatorAdapter", () => {
	const drills = [
		{ date: new Date(2021, 2, 15), place: "Simulacro Tsunami", city: "Valdivia" },
		{ date: new Date(2021, 5, 10), place: "Simulacro Tsunami", city: "Arica" },
		{ date: new Date(2021, 8, 20), place: "Simulacro Terremoto", city: "Valdivia" },
		{ date: new Date(2021, 10, 5), place: "Simulacro Tsunami", city: "Santiago" }
	];

	it("should count total drills", () => {
		const result = calculator.calculate(drills);
		expect(result.totalDrills).toBe(4);
	});

	it("should group drills by city", () => {
		const result = calculator.calculate(drills);
		expect(result.drillsByCity).toEqual({
			Valdivia: 2,
			Arica: 1,
			Santiago: 1
		});
	});

	it("should return zero totals for empty data", () => {
		const result = calculator.calculate([]);
		expect(result.totalDrills).toBe(0);
		expect(result.drillsByCity).toEqual({});
	});

	it("should count single city correctly", () => {
		const single = [
			{ date: new Date(2021, 0, 1), place: "Simulacro", city: "Arica" }
		];
		const result = calculator.calculate(single);
		expect(result.totalDrills).toBe(1);
		expect(result.drillsByCity).toEqual({ Arica: 1 });
	});
});
