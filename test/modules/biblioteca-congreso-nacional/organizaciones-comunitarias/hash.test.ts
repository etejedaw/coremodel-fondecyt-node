import { OrganizacionesComunitariasHashAdapter } from "../../../../src/modules/biblioteca-congreso-nacional/organizaciones-comunitarias/hash";

const adapter = new OrganizacionesComunitariasHashAdapter();

describe("OrganizacionesComunitariasHashAdapter", () => {
	it("should generate a deterministic hash", () => {
		const data = {
			nDeCentrosDeMadres: 10,
			nDeOtrasOrganizacionesComunitariasFuncionalesOtros: 5,
			nDeCentrosDePadresYApoderados: 20,
			nDeUnionesComunales: 3,
			nDeJuntasDeVecinos: 50,
			nCentrosCulturales: 8,
			nDeOrganizacionesComunitariasSumaTotal: 120,
			nDeClubesDeportivos: 15,
			nDeCentrosUOrganizacionesDelAdultoMayor: 7,
			nDeCompaniasDeBomberos: 2,
			anio: 2020,
			indicator: "valdivia-organizaciones-comunitaras",
			module: "biblioteca-congreso-nacional"
		};

		const hash1 = adapter.generate(data);
		const hash2 = adapter.generate(data);
		expect(hash1).toBe(hash2);
	});

	it("should generate different hashes for different years", () => {
		const base = {
			nDeCentrosDeMadres: 10,
			nDeOtrasOrganizacionesComunitariasFuncionalesOtros: 5,
			nDeCentrosDePadresYApoderados: 20,
			nDeUnionesComunales: 3,
			nDeJuntasDeVecinos: 50,
			nCentrosCulturales: 8,
			nDeOrganizacionesComunitariasSumaTotal: 120,
			nDeClubesDeportivos: 15,
			nDeCentrosUOrganizacionesDelAdultoMayor: 7,
			nDeCompaniasDeBomberos: 2,
			indicator: "valdivia-organizaciones-comunitaras",
			module: "biblioteca-congreso-nacional"
		};

		const hash1 = adapter.generate({ ...base, anio: 2020 });
		const hash2 = adapter.generate({ ...base, anio: 2021 });
		expect(hash1).not.toBe(hash2);
	});
});
