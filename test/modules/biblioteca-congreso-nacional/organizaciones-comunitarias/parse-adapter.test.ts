import { OrganizacionesComunitariasParseAdapter } from "../../../../src/modules/biblioteca-congreso-nacional/organizaciones-comunitarias/parse-adapter";

const adapter = new OrganizacionesComunitariasParseAdapter();

describe("OrganizacionesComunitariasParseAdapter", () => {
	it("should extract datosTemaN from JSON", () => {
		const json = JSON.stringify({
			datosTemaN: [
				{ n_de_juntas_de_vecinos: "50", anio: "2020" },
				{ n_de_juntas_de_vecinos: "55", anio: "2021" }
			],
			otrosCampos: "ignorados"
		});

		const result = adapter.extract(json);

		expect(result).toHaveLength(2);
		expect(result[0]).toEqual({
			n_de_juntas_de_vecinos: "50",
			anio: "2020"
		});
	});

	it("should return undefined when datosTemaN is missing", () => {
		const json = JSON.stringify({ otro: "dato" });
		const result = adapter.extract(json);
		expect(result).toBeUndefined();
	});
});
