import { EmergenciaDesastresHashAdapter } from "../../../src/modules/emergencias-desastres/hash";

const adapter = new EmergenciaDesastresHashAdapter();

describe("EmergenciaDesastresHashAdapter", () => {
	it("should generate a slug from date and city", () => {
		const data = {
			date: new Date(2021, 2, 15),
			place: "Simulacro de Tsunami",
			city: "Valdivia",
			indicator: "simulacros-2021",
			module: "emergencia-desastres"
		};

		const hash = adapter.generate(data);
		expect(hash).toBe("2021-03-15-valdivia");
	});

	it("should generate different hashes for different dates", () => {
		const base = {
			place: "Simulacro",
			city: "Valdivia",
			indicator: "simulacros-2021",
			module: "emergencia-desastres"
		};

		const hash1 = adapter.generate({ ...base, date: new Date(2021, 2, 15) });
		const hash2 = adapter.generate({ ...base, date: new Date(2021, 10, 20) });
		expect(hash1).not.toBe(hash2);
	});

	it("should generate different hashes for different cities", () => {
		const base = {
			date: new Date(2021, 2, 15),
			place: "Simulacro",
			indicator: "simulacros-2021",
			module: "emergencia-desastres"
		};

		const hash1 = adapter.generate({ ...base, city: "Valdivia" });
		const hash2 = adapter.generate({ ...base, city: "Santiago" });
		expect(hash1).not.toBe(hash2);
	});
});
