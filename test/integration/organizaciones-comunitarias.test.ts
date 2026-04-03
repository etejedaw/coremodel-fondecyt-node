import { OrganizacionesComunitariasParseAdapter } from "../../src/modules/biblioteca-congreso-nacional/organizaciones-comunitarias/parse-adapter";
import { OrganizacionesComunitariasMapperAdapter } from "../../src/modules/biblioteca-congreso-nacional/organizaciones-comunitarias/mapper";
import { OrganizacionesComunitariasHashAdapter } from "../../src/modules/biblioteca-congreso-nacional/organizaciones-comunitarias/hash";

const MODULE = "biblioteca-congreso-nacional";
const INDICATOR = "valdivia-organizaciones-comunitaras";

const parseAdapter = new OrganizacionesComunitariasParseAdapter();
const mapper = new OrganizacionesComunitariasMapperAdapter();
const hasher = new OrganizacionesComunitariasHashAdapter();

const sampleJson = JSON.stringify({
	datosTemaN: [
		{
			n_de_centros_de_madres: "12",
			n_de_otras_organizaciones_comunitarias_funcionales_otros: "45",
			n_de_centros_de_padres_y_apoderados: "30",
			n_de_uniones_comunales: "5",
			n_de_juntas_de_vecinos: "98",
			n_centros_culturales: "15",
			n_de_organizaciones_comunitarias_suma_total: "250",
			n_de_clubes_deportivos: "35",
			n_de_centros_u_organizaciones_del_adulto_mayor: "8",
			n_de_companias_de_bomberos: "2",
			anio: "2020"
		},
		{
			n_de_centros_de_madres: "10",
			n_de_otras_organizaciones_comunitarias_funcionales_otros: "50",
			n_de_centros_de_padres_y_apoderados: "28",
			n_de_uniones_comunales: "5",
			n_de_juntas_de_vecinos: "102",
			n_centros_culturales: "18",
			n_de_organizaciones_comunitarias_suma_total: "260",
			n_de_clubes_deportivos: "38",
			n_de_centros_u_organizaciones_del_adulto_mayor: "7",
			n_de_companias_de_bomberos: "2",
			anio: "2021"
		}
	]
});

describe("Organizaciones Comunitarias - ETL integration", () => {
	it("should process JSON through the full pipeline: parse → map → hash", () => {
		const parsed = parseAdapter.extract(sampleJson);
		expect(parsed).toHaveLength(2);

		const mapped = parsed.map(item => mapper.map(item as any));
		expect(mapped[0].nDeJuntasDeVecinos).toBe(98);
		expect(mapped[0].anio).toBe(2020);
		expect(mapped[1].nDeJuntasDeVecinos).toBe(102);
		expect(mapped[1].anio).toBe(2021);

		const withMetadata = mapped.map(item => ({
			...item,
			indicator: INDICATOR,
			module: MODULE
		}));

		const final = withMetadata.map(item => ({
			...item,
			key: hasher.generate(item)
		}));

		expect(final).toHaveLength(2);

		expect(final[0]).toMatchObject({
			nDeCentrosDeMadres: 12,
			nDeJuntasDeVecinos: 98,
			nDeClubesDeportivos: 35,
			nDeCompaniasDeBomberos: 2,
			nDeOrganizacionesComunitariasSumaTotal: 250,
			anio: 2020,
			indicator: INDICATOR,
			module: MODULE
		});
		expect(final[0].key).toBeDefined();
	});

	it("should generate unique keys per year", () => {
		const parsed = parseAdapter.extract(sampleJson);
		const final = parsed
			.map(item => mapper.map(item as any))
			.map(item => ({ ...item, indicator: INDICATOR, module: MODULE }))
			.map(item => ({ ...item, key: hasher.generate(item) }));

		const keys = final.map(item => item.key);
		const uniqueKeys = new Set(keys);
		expect(uniqueKeys.size).toBe(keys.length);
	});

	it("should produce deterministic keys across runs", () => {
		const run = () => {
			const parsed = parseAdapter.extract(sampleJson);
			return parsed
				.map(item => mapper.map(item as any))
				.map(item => ({ ...item, indicator: INDICATOR, module: MODULE }))
				.map(item => ({ ...item, key: hasher.generate(item) }));
		};

		const first = run();
		const second = run();
		expect(first.map(i => i.key)).toEqual(second.map(i => i.key));
	});
});

describe("Organizaciones Comunitarias - Validación contra datos manuales", () => {
	it("should correctly map all 11 organization types from source", () => {
		const parsed = parseAdapter.extract(sampleJson);
		const mapped = parsed.map(item => mapper.map(item as any));

		const year2020 = mapped[0];
		expect(year2020.nDeCentrosDeMadres).toBe(12);
		expect(year2020.nDeOtrasOrganizacionesComunitariasFuncionalesOtros).toBe(45);
		expect(year2020.nDeCentrosDePadresYApoderados).toBe(30);
		expect(year2020.nDeUnionesComunales).toBe(5);
		expect(year2020.nDeJuntasDeVecinos).toBe(98);
		expect(year2020.nCentrosCulturales).toBe(15);
		expect(year2020.nDeOrganizacionesComunitariasSumaTotal).toBe(250);
		expect(year2020.nDeClubesDeportivos).toBe(35);
		expect(year2020.nDeCentrosUOrganizacionesDelAdultoMayor).toBe(8);
		expect(year2020.nDeCompaniasDeBomberos).toBe(2);
		expect(year2020.anio).toBe(2020);
	});

	it("should reflect year-over-year changes in organizations", () => {
		const parsed = parseAdapter.extract(sampleJson);
		const mapped = parsed.map(item => mapper.map(item as any));

		expect(mapped[1].nDeJuntasDeVecinos - mapped[0].nDeJuntasDeVecinos).toBe(4);
		expect(mapped[1].nDeCentrosDeMadres - mapped[0].nDeCentrosDeMadres).toBe(-2);
	});
});
