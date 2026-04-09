import { TasaPobrezaMapperAdapter } from "../../../../src/modules/biblioteca-congreso-nacional/tasa-pobreza-ingresos/mapper";

const mapper = new TasaPobrezaMapperAdapter();

describe("TasaPobrezaMapperAdapter", () => {
	it("should convert comma-separated decimals to numbers", () => {
		const result = mapper.map({
			unidadTerritorial: "Valdivia",
			casen2017: "12,5",
			casen2022: "10,3"
		});

		expect(result).toEqual({
			unidadTerritorial: "Valdivia",
			casen2017: 12.5,
			casen2022: 10.3
		});
	});

	it("should handle integer values", () => {
		const result = mapper.map({
			unidadTerritorial: "Test",
			casen2017: "15",
			casen2022: "10"
		});

		expect(result.casen2017).toBe(15);
		expect(result.casen2022).toBe(10);
	});
});
