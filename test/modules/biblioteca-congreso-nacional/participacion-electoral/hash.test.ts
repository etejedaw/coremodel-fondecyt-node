import { ParticipacionElectoralHashAdapter } from "../../../../src/modules/biblioteca-congreso-nacional/participacion-electoral/hash";

const adapter = new ParticipacionElectoralHashAdapter();

const base = {
	eleccion: "Elecciones generales 2025",
	unidadTerritorial: "Comuna de Valdivia",
	inscritos: 147528,
	votantes: 125299,
	participacionFuente: 84.9,
	participacion: 84.93,
	indicator: "valdivia-participacion-electoral",
	module: "biblioteca-congreso-nacional"
};

describe("ParticipacionElectoralHashAdapter", () => {
	it("should generate a slug from territory, election, module and indicator", () => {
		expect(adapter.generate(base)).toBe(
			"comuna-de-valdivia-elecciones-generales-2025-biblioteca-congreso-nacional-valdivia-participacion-electoral"
		);
	});

	it("should generate different hashes for different territories", () => {
		const regional = adapter.generate({
			...base,
			unidadTerritorial: "Región de Los Ríos"
		});

		expect(regional).not.toBe(adapter.generate(base));
	});

	it("should generate different hashes for different elections", () => {
		const runoff = adapter.generate({
			...base,
			eleccion: "2da vuelta presidencial, 2025"
		});

		expect(runoff).not.toBe(adapter.generate(base));
	});

	it("should ignore the requested report year so a repeated election is not duplicated", () => {
		const fromReport2020 = adapter.generate({
			...base,
			year: "2020"
		} as typeof base);
		const fromReport2021 = adapter.generate({
			...base,
			year: "2021"
		} as typeof base);

		expect(fromReport2020).toBe(fromReport2021);
	});
});
