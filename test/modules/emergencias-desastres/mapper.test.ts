import { EmergenciaDesastresMapper } from "../../../src/modules/emergencias-desastres/mapper";
import { Input } from "../../../src/modules/emergencias-desastres/interfaces";

const mapper = new EmergenciaDesastresMapper();

describe("EmergenciaDesastresMapper", () => {
	it("should transform input to output with correct date", () => {
		const input: Input = {
			date: { day: 15, month: "Mar", year: 2021 },
			place: { type: "Simulacro de Tsunami", city: "Valdivia" }
		};

		const result = mapper.map(input);

		expect(result.date).toEqual(new Date(2021, 2, 15));
		expect(result.place).toBe("Simulacro de Tsunami");
		expect(result.city).toBe("Valdivia");
	});

	it("should map all months correctly", () => {
		const months = [
			{ name: "Ene", expected: 0 },
			{ name: "Feb", expected: 1 },
			{ name: "Jun", expected: 5 },
			{ name: "Dic", expected: 11 }
		];

		months.forEach(({ name, expected }) => {
			const input: Input = {
				date: { day: 1, month: name, year: 2021 },
				place: { type: "Test", city: "Test" }
			};
			const result = mapper.map(input);
			expect(result.date.getMonth()).toBe(expected);
		});
	});
});
