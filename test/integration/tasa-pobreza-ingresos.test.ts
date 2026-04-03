import { TasaPobrezaIngresosParseAdapter } from "../../src/modules/biblioteca-congreso-nacional/tasa-pobreza-ingresos/parse-adapter";
import { TasaPobrezaMapperAdapter } from "../../src/modules/biblioteca-congreso-nacional/tasa-pobreza-ingresos/mapper";
import { TasaPobrezaIngresosHashAdapter } from "../../src/modules/biblioteca-congreso-nacional/tasa-pobreza-ingresos/hash";

const MODULE = "biblioteca-congreso-nacional";
const INDICATOR = "valdivia-tasa-pobreza-ingresos";

const parseAdapter = new TasaPobrezaIngresosParseAdapter();
const mapper = new TasaPobrezaMapperAdapter();
const hasher = new TasaPobrezaIngresosHashAdapter();

// HTML realista que simula la estructura de BCN reportes comunales
const sampleHtml = `
<div class="z-depth-1">
  <h6>2.1 Tasa de Pobreza por ingresos</h6>
  <table>
    <tr><th>Unidad Territorial</th><th>Casen 2017</th><th>Casen 2022</th></tr>
    <tr><td>(%)</td><td>(%)</td><td>(%)</td></tr>
    <tr><td>Valdivia</td><td>12,5</td><td>10,3</td></tr>
    <tr><td>Región de los Ríos</td><td>15,1</td><td>13,7</td></tr>
    <tr><td>País</td><td>8,6</td><td>6,5</td></tr>
  </table>
</div>
`;

describe("Tasa Pobreza Ingresos - ETL integration", () => {
	it("should process HTML through the full pipeline: parse → map → hash", () => {
		// 1. Parse
		const parsed = parseAdapter.extract(sampleHtml);
		expect(parsed).toHaveLength(3);

		// 2. Map
		const mapped = parsed.map(item => mapper.map(item as any));
		expect(mapped[0].unidadTerritorial).toBe("Valdivia");
		expect(mapped[0].casen2017).toBe(12.5);
		expect(mapped[0].casen2022).toBe(10.3);

		// 3. Add metadata
		const withMetadata = mapped.map(item => ({
			...item,
			indicator: INDICATOR,
			module: MODULE
		}));

		// 4. Hash
		const final = withMetadata.map(item => ({
			...item,
			key: hasher.generate(item)
		}));

		expect(final).toHaveLength(3);
		expect(final[0].key).toBe(
			"valdivia-biblioteca-congreso-nacional-valdivia-tasa-pobreza-ingresos"
		);

		// Verificar estructura completa
		expect(final[0]).toEqual({
			unidadTerritorial: "Valdivia",
			casen2017: 12.5,
			casen2022: 10.3,
			indicator: INDICATOR,
			module: MODULE,
			key: "valdivia-biblioteca-congreso-nacional-valdivia-tasa-pobreza-ingresos"
		});
	});

	it("should generate unique keys for each territory", () => {
		const parsed = parseAdapter.extract(sampleHtml);
		const final = parsed
			.map(item => mapper.map(item as any))
			.map(item => ({ ...item, indicator: INDICATOR, module: MODULE }))
			.map(item => ({ ...item, key: hasher.generate(item) }));

		const keys = final.map(item => item.key);
		const uniqueKeys = new Set(keys);
		expect(uniqueKeys.size).toBe(keys.length);
	});
});

describe("Tasa Pobreza Ingresos - Validación contra datos manuales", () => {
	it("should correctly convert Chilean decimal format to numbers", () => {
		// En Chile se usa coma como separador decimal
		// Un investigador leería "12,5" como 12.5%
		const parsed = parseAdapter.extract(sampleHtml);
		const mapped = parsed.map(item => mapper.map(item as any));

		// Valdivia: CASEN 2017 = 12.5%, CASEN 2022 = 10.3%
		expect(mapped[0].casen2017).toBe(12.5);
		expect(mapped[0].casen2022).toBe(10.3);

		// Región de los Ríos: CASEN 2017 = 15.1%, CASEN 2022 = 13.7%
		expect(mapped[1].casen2017).toBe(15.1);
		expect(mapped[1].casen2022).toBe(13.7);

		// País: CASEN 2017 = 8.6%, CASEN 2022 = 6.5%
		expect(mapped[2].casen2017).toBe(8.6);
		expect(mapped[2].casen2022).toBe(6.5);
	});

	it("should preserve territorial unit names exactly as in source", () => {
		const parsed = parseAdapter.extract(sampleHtml);
		const mapped = parsed.map(item => mapper.map(item as any));

		expect(mapped[0].unidadTerritorial).toBe("Valdivia");
		expect(mapped[1].unidadTerritorial).toBe("Región de los Ríos");
		expect(mapped[2].unidadTerritorial).toBe("País");
	});
});
