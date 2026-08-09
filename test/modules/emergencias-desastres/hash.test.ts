import { EmergenciaDesastresHashAdapter } from "../../../src/modules/emergencias-desastres/hash";

const adapter = new EmergenciaDesastresHashAdapter();

describe("EmergenciaDesastresHashAdapter", () => {
	it("should generate a slug from date and region", () => {
		const data = {
			date: new Date(2021, 2, 15),
			place: "Simulacro de Tsunami",
			region: "Los Ríos",
			regionSource: "Los Ríos",
			indicator: "simulacros-2021",
			module: "emergencia-desastres"
		};

		const hash = adapter.generate(data);
		expect(hash).toBe("2021-03-15-los-rios");
	});

	it("should generate different hashes for different dates", () => {
		const base = {
			place: "Simulacro",
			region: "Los Ríos",
			regionSource: "Los Ríos",
			indicator: "simulacros-2021",
			module: "emergencia-desastres"
		};

		const hash1 = adapter.generate({ ...base, date: new Date(2021, 2, 15) });
		const hash2 = adapter.generate({ ...base, date: new Date(2021, 10, 20) });
		expect(hash1).not.toBe(hash2);
	});

	it("should generate different hashes for different regions", () => {
		const base = {
			date: new Date(2021, 2, 15),
			place: "Simulacro",
			indicator: "simulacros-2021",
			module: "emergencia-desastres"
		};

		const hash1 = adapter.generate({
			...base,
			region: "Los Ríos",
			regionSource: "Los Ríos"
		});
		const hash2 = adapter.generate({
			...base,
			region: "Maule",
			regionSource: "Maule"
		});
		expect(hash1).not.toBe(hash2);
	});

	it("should collapse two spellings of the same region into one key", () => {
		const base = {
			date: new Date(2022, 7, 11),
			place: "Simulacro",
			indicator: "simulacros-2022",
			module: "emergencia-desastres"
		};

		// La fuente escribe la misma region con apostrofo tipografico y con
		// acento agudo; ambas deben producir la misma clave para que el
		// registro no se duplique.
		const hash1 = adapter.generate({
			...base,
			region: "O'Higgins",
			regionSource: "O'Higgins"
		});
		const hash2 = adapter.generate({
			...base,
			region: "O'Higgins",
			regionSource: "O´Higgins"
		});
		expect(hash1).toBe(hash2);
	});
});
