import { DateParserAdapter } from "../../src/modules/emergencias-desastres/parse-adapter";
import { EmergenciaDesastresMapper } from "../../src/modules/emergencias-desastres/mapper";
import { EmergenciaDesastresHashAdapter } from "../../src/modules/emergencias-desastres/hash";

const MODULE = "emergencia-desastres";
const INDICATOR = "simulacros-2021";

const parseAdapter = new DateParserAdapter();
const mapper = new EmergenciaDesastresMapper();
const hasher = new EmergenciaDesastresHashAdapter();

// HTML realista que simula la estructura de emergenciaydesastres.mineduc.cl
const sampleHtml = `
<div class="back-fechas">
  <div class="item">
    <div class="card">
      <div class="caja-date">
        <span class="dat_day">25</span>
        <span class="dat_mes">Mar</span>
        <span class="dat_year">2021</span>
      </div>
      <div class="card-body">
        <h5 class="card-title"><a>Simulacro Tsunami</a></h5>
        <h5 class="card-title pb-3">Valdivia</h5>
      </div>
    </div>
  </div>
  <div class="item">
    <div class="card">
      <div class="caja-date">
        <span class="dat_day">3</span>
        <span class="dat_mes">Nov</span>
        <span class="dat_year">2021</span>
      </div>
      <div class="card-body">
        <h5 class="card-title"><a>Simulacro Terremoto</a></h5>
        <h5 class="card-title pb-3">Concepción</h5>
      </div>
    </div>
  </div>
</div>
`;

describe("Emergencias Desastres - ETL integration", () => {
	it("should process HTML through the full pipeline: parse → map → hash", () => {
		// 1. Parse
		const parsed = parseAdapter.extract(sampleHtml);
		expect(parsed).toHaveLength(2);

		// 2. Map
		const mapped = parsed.map(item => mapper.map(item));
		expect(mapped[0].date).toBeInstanceOf(Date);
		expect(mapped[0].place).toBe("Simulacro Tsunami");
		expect(mapped[0].city).toBe("Valdivia");

		// 3. Add metadata (como hace ScrapeBase.init)
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

		expect(final).toHaveLength(2);
		expect(final[0].key).toBe("2021-03-25-valdivia");
		expect(final[1].key).toBe("2021-11-03-concepcion");

		// Verificar estructura completa del registro final
		expect(final[0]).toEqual({
			date: new Date(2021, 2, 25),
			place: "Simulacro Tsunami",
			city: "Valdivia",
			indicator: INDICATOR,
			module: MODULE,
			key: "2021-03-25-valdivia"
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
});

describe("Emergencias Desastres - Validación contra datos manuales", () => {
	it("should match manually verified drill data", () => {
		// Datos de referencia: un simulacro conocido del 25 de marzo de 2021 en Valdivia
		const parsed = parseAdapter.extract(sampleHtml);
		const result = parsed
			.map(item => mapper.map(item))
			.map(item => ({ ...item, indicator: INDICATOR, module: MODULE }))
			.map(item => ({ ...item, key: hasher.generate(item) }));

		// Validación manual: fecha correcta (25 de marzo = mes index 2)
		expect(result[0].date.getFullYear()).toBe(2021);
		expect(result[0].date.getMonth()).toBe(2); // Marzo = 2
		expect(result[0].date.getDate()).toBe(25);
		expect(result[0].city).toBe("Valdivia");

		// Validación manual: segundo registro (3 de noviembre)
		expect(result[1].date.getFullYear()).toBe(2021);
		expect(result[1].date.getMonth()).toBe(10); // Noviembre = 10
		expect(result[1].date.getDate()).toBe(3);
		expect(result[1].city).toBe("Concepción");
	});
});
