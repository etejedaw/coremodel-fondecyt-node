import { TasaPobrezaIngresosHashAdapter } from "../../../../src/modules/biblioteca-congreso-nacional/tasa-pobreza-ingresos/hash";

const adapter = new TasaPobrezaIngresosHashAdapter();

describe("TasaPobrezaIngresosHashAdapter", () => {
	it("should generate a slug from territory, module and indicator", () => {
		const hash = adapter.generate({
			unidadTerritorial: "Valdivia",
			casen2017: 12.5,
			casen2022: 10.3,
			indicator: "valdivia-tasa-pobreza-ingresos",
			module: "biblioteca-congreso-nacional"
		});

		expect(hash).toBe(
			"valdivia-biblioteca-congreso-nacional-valdivia-tasa-pobreza-ingresos"
		);
	});

	it("should generate different hashes for different territories", () => {
		const base = {
			casen2017: 12.5,
			casen2022: 10.3,
			indicator: "valdivia-tasa-pobreza-ingresos",
			module: "biblioteca-congreso-nacional"
		};

		const hash1 = adapter.generate({ ...base, unidadTerritorial: "Valdivia" });
		const hash2 = adapter.generate({
			...base,
			unidadTerritorial: "Región de los Ríos"
		});
		expect(hash1).not.toBe(hash2);
	});
});
