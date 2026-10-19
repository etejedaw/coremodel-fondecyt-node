import { ParticipacionElectoralMapperAdapter } from "../../../../src/modules/biblioteca-congreso-nacional/participacion-electoral/mapper";

const mapper = new ParticipacionElectoralMapperAdapter();

describe("ParticipacionElectoralMapperAdapter", () => {
	it("should convert counts with thousands separators and compute participation", () => {
		const result = mapper.map({
			eleccion: "Elecciones generales 2025",
			unidadTerritorial: "Comuna de Valdivia",
			inscritos: "147.528",
			votantes: "125.299",
			participacionFuente: "84,9"
		});

		expect(result).toEqual({
			eleccion: "Elecciones generales 2025",
			unidadTerritorial: "Comuna de Valdivia",
			inscritos: 147528,
			votantes: 125299,
			participacionFuente: 84.9,
			participacion: 84.93
		});
	});

	it("should round the floating point noise the source publishes", () => {
		const result = mapper.map({
			eleccion: "Plebiscito Constitucional 2023, 17 de diciembre 2023",
			unidadTerritorial: "Región de Los Ríos",
			inscritos: "362.741",
			votantes: "302.498",
			participacionFuente: "83,4000000000000057"
		});

		expect(result.participacionFuente).toBe(83.4);
		expect(result.participacion).toBe(83.39);
	});
});
