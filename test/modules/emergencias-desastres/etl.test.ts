import { DateParserAdapter } from "../../../src/modules/emergencias-desastres/parse-adapter";
import { EmergenciaDesastresMapper } from "../../../src/modules/emergencias-desastres/mapper";
import { EmergenciaDesastresHashAdapter } from "../../../src/modules/emergencias-desastres/hash";

const MODULE = "emergencia-desastres";
const INDICATOR = "simulacros-2021";

const parseAdapter = new DateParserAdapter();
const mapper = new EmergenciaDesastresMapper();
const hasher = new EmergenciaDesastresHashAdapter();

const sampleHtml = `
<div class="back-fechas">
  <div class="item">
    <div class="card">
      <div class="caja-date">
        <span class="dat_day">27</span>
        <span class="dat_mes">May</span>
        <span class="dat_year">2021</span>
      </div>
      <div class="card-body">
        <h5 class="card-title"><a>Sismo Tsunami - Sector Educación</a></h5>
        <h5 class="card-title pb-3">Arica</h5>
      </div>
    </div>
  </div>
  <div class="item">
    <div class="card">
      <div class="caja-date">
        <span class="dat_day">7</span>
        <span class="dat_mes">Jun</span>
        <span class="dat_year">2021</span>
      </div>
      <div class="card-body">
        <h5 class="card-title"><a>Remoción en Masa</a></h5>
        <h5 class="card-title pb-3">Tarapacá</h5>
      </div>
    </div>
  </div>
</div>
`;

describe("Emergencias Desastres - ETL integration", () => {
	it("should process HTML through the full pipeline: parse → map → hash", () => {
		const parsed = parseAdapter.extract(sampleHtml);
		expect(parsed).toHaveLength(2);

		const mapped = parsed.map(item => mapper.map(item));
		expect(mapped[0].date).toBeInstanceOf(Date);
		expect(mapped[0].place).toBe("Sismo Tsunami - Sector Educación");
		expect(mapped[0].region).toBe("Arica y Parinacota");

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
		expect(final[0].key).toBe("2021-05-27-arica-y-parinacota");
		expect(final[1].key).toBe("2021-06-07-tarapaca");

		expect(final[0]).toEqual({
			date: new Date(2021, 4, 27),
			place: "Sismo Tsunami - Sector Educación",
			region: "Arica y Parinacota",
			regionSource: "Arica",
			indicator: INDICATOR,
			module: MODULE,
			key: "2021-05-27-arica-y-parinacota"
		});
	});

	it("should generate unique keys for each record", () => {
		const parsed = parseAdapter.extract(sampleHtml);
		const final = parsed
			.map(item => mapper.map(item))
			.map(item => ({ ...item, indicator: INDICATOR, module: MODULE }))
			.map(item => ({ ...item, key: hasher.generate(item) }));

		const keys = final.map(item => item.key);
		const uniqueKeys = new Set(keys);
		expect(uniqueKeys.size).toBe(keys.length);
	});

	it("should preserve the source spelling alongside the canonical region", () => {
		const parsed = parseAdapter.extract(sampleHtml);
		const mapped = parsed.map(item => mapper.map(item));

		// La normalizacion no debe destruir el dato publicado: se conserva para
		// poder auditar la extraccion contra la fuente original.
		expect(mapped[0].regionSource).toBe("Arica");
		expect(mapped[0].region).toBe("Arica y Parinacota");
	});
});

describe("Emergencias Desastres - Validación contra datos manuales", () => {
	it("should match manually verified drill data", () => {
		const parsed = parseAdapter.extract(sampleHtml);
		const result = parsed
			.map(item => mapper.map(item))
			.map(item => ({ ...item, indicator: INDICATOR, module: MODULE }))
			.map(item => ({ ...item, key: hasher.generate(item) }));

		expect(result[0].date.getFullYear()).toBe(2021);
		expect(result[0].date.getMonth()).toBe(4);
		expect(result[0].date.getDate()).toBe(27);
		expect(result[0].region).toBe("Arica y Parinacota");

		expect(result[1].date.getFullYear()).toBe(2021);
		expect(result[1].date.getMonth()).toBe(5);
		expect(result[1].date.getDate()).toBe(7);
		expect(result[1].region).toBe("Tarapacá");
	});
});
