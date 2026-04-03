import { OrganizacionesComunitariasMapperAdapter } from "../../../../src/modules/biblioteca-congreso-nacional/organizaciones-comunitarias/mapper";
import { Input } from "../../../../src/modules/biblioteca-congreso-nacional/organizaciones-comunitarias/interfaces";

const mapper = new OrganizacionesComunitariasMapperAdapter();

describe("OrganizacionesComunitariasMapperAdapter", () => {
	it("should convert all string fields to numbers", () => {
		const input: Input = {
			n_de_centros_de_madres: "10",
			n_de_otras_organizaciones_comunitarias_funcionales_otros: "5",
			n_de_centros_de_padres_y_apoderados: "20",
			n_de_uniones_comunales: "3",
			n_de_juntas_de_vecinos: "50",
			n_centros_culturales: "8",
			n_de_organizaciones_comunitarias_suma_total: "120",
			n_de_clubes_deportivos: "15",
			n_de_centros_u_organizaciones_del_adulto_mayor: "7",
			n_de_companias_de_bomberos: "2",
			anio: "2020"
		};

		const result = mapper.map(input);

		expect(result.nDeCentrosDeMadres).toBe(10);
		expect(result.nDeJuntasDeVecinos).toBe(50);
		expect(result.nDeClubesDeportivos).toBe(15);
		expect(result.nDeCompaniasDeBomberos).toBe(2);
		expect(result.nDeOrganizacionesComunitariasSumaTotal).toBe(120);
		expect(result.anio).toBe(2020);
	});

	it("should default to 0 for non-numeric or empty values", () => {
		const input: Input = {
			n_de_centros_de_madres: "",
			n_de_otras_organizaciones_comunitarias_funcionales_otros: "abc",
			n_de_centros_de_padres_y_apoderados: "",
			n_de_uniones_comunales: "",
			n_de_juntas_de_vecinos: "",
			n_centros_culturales: "",
			n_de_organizaciones_comunitarias_suma_total: "",
			n_de_clubes_deportivos: "",
			n_de_centros_u_organizaciones_del_adulto_mayor: "",
			n_de_companias_de_bomberos: "",
			anio: "2020"
		};

		const result = mapper.map(input);

		expect(result.nDeCentrosDeMadres).toBe(0);
		expect(result.nDeOtrasOrganizacionesComunitariasFuncionalesOtros).toBe(0);
	});
});
