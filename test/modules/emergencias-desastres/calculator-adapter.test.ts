import { TsunamiDrillsCalculatorAdapter } from "../../../src/modules/emergencias-desastres/calculator-adapter";

const calculator = new TsunamiDrillsCalculatorAdapter();

describe("TsunamiDrillsCalculatorAdapter", () => {
	const drills = [
		{
			date: new Date(2021, 2, 15),
			place: "Simulacro Tsunami",
			region: "Los Ríos"
		},
		{
			date: new Date(2021, 5, 10),
			place: "Simulacro Tsunami",
			region: "Arica y Parinacota"
		},
		{
			date: new Date(2021, 8, 20),
			place: "Simulacro Terremoto",
			region: "Los Ríos"
		},
		{
			date: new Date(2021, 10, 5),
			place: "Simulacro Tsunami",
			region: "Metropolitana"
		}
	];

	it("should count total drills", () => {
		const result = calculator.calculate(drills);
		expect(result.totalDrills).toBe(4);
	});

	it("should group drills by region", () => {
		const result = calculator.calculate(drills);
		expect(result.drillsByRegion).toEqual({
			"Los Ríos": 2,
			"Arica y Parinacota": 1,
			Metropolitana: 1
		});
	});

	it("should return zero totals for empty data", () => {
		const result = calculator.calculate([]);
		expect(result.totalDrills).toBe(0);
		expect(result.drillsByRegion).toEqual({});
	});

	it("should count single region correctly", () => {
		const single = [
			{
				date: new Date(2021, 0, 1),
				place: "Simulacro",
				region: "Arica y Parinacota"
			}
		];
		const result = calculator.calculate(single);
		expect(result.totalDrills).toBe(1);
		expect(result.drillsByRegion).toEqual({ "Arica y Parinacota": 1 });
	});

	it("should aggregate drills that the source spelled differently", () => {
		const normalized = [
			{ date: new Date(2021, 0, 1), place: "Simulacro", region: "Magallanes" },
			{ date: new Date(2022, 0, 1), place: "Simulacro", region: "Magallanes" }
		];
		const result = calculator.calculate(normalized);
		expect(result.drillsByRegion).toEqual({ Magallanes: 2 });
	});
});
