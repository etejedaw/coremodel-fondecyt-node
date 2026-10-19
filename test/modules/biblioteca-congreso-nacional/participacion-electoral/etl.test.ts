import { ParticipacionElectoralParseAdapter } from "../../../../src/modules/biblioteca-congreso-nacional/participacion-electoral/parse-adapter";
import { ParticipacionElectoralMapperAdapter } from "../../../../src/modules/biblioteca-congreso-nacional/participacion-electoral/mapper";
import { ParticipacionElectoralHashAdapter } from "../../../../src/modules/biblioteca-congreso-nacional/participacion-electoral/hash";

const MODULE = "biblioteca-congreso-nacional";
const YEAR = "2024";
const INDICATOR = "valdivia-participacion-electoral";

const parseAdapter = new ParticipacionElectoralParseAdapter();
const mapper = new ParticipacionElectoralMapperAdapter();
const hasher = new ParticipacionElectoralHashAdapter();

const sampleHtml = `
<div class="z-depth-1 p-4 rounded mb-5">
  <h6>8.1 Inscritos, Votación (n°) y participación (%). Plebiscito Constitucional 2023, 17 de diciembre 2023</h6>
  <table class="table table-sm table-responsive-sm">
    <thead>
      <tr></tr>
      <tr><th>Unidad Territorial</th><th>Mesas Total</th><th>Inscritos Total</th><th>Votación</th><th>Participación (%)</th></tr>
    </thead>
    <tr><td>Comuna de Valdivia</td><td>374</td><td>144.650</td><td>121.516</td><td>84</td></tr>
    <tr><td>Región de Los Ríos</td><td>953</td><td>362.741</td><td>302.498</td><td>83,4000000000000057</td></tr>
    <tr><td>País, sin voto exterior</td><td>39.390</td><td>15.278.800</td><td>12.984.823</td><td>85</td></tr>
  </table>
</div>
<div class="z-depth-1 p-4 rounded mb-5">
  <h6>8.2 Resultado Plebiscito Constitucional 2023. Cantidad de votos, 17 de diciembre 2023</h6>
  <table class="table table-sm table-responsive-sm">
    <tr><th>Unidad Territorial</th><th>A Favor</th><th>En Contra</th><th>Votos Nulos</th><th>Votos Blancos</th><th>Total Votos</th></tr>
    <tr><td>Comuna de Valdivia</td><td>46.236</td><td>69.427</td><td>4.128</td><td>1.725</td><td>121.516</td></tr>
  </table>
</div>
`;

function runPipeline(html: string) {
	return parseAdapter
		.extract(html)
		.map(item => mapper.map(item))
		.map(item => ({
			...item,
			year: YEAR,
			indicator: INDICATOR,
			module: MODULE
		}))
		.map(item => ({ ...item, key: hasher.generate(item) }));
}

describe("Participacion Electoral - ETL integration", () => {
	it("should process HTML through the full pipeline: parse → map → hash", () => {
		const final = runPipeline(sampleHtml);

		expect(final).toHaveLength(3);
		expect(final[0]).toEqual({
			eleccion: "Plebiscito Constitucional 2023, 17 de diciembre 2023",
			unidadTerritorial: "Comuna de Valdivia",
			inscritos: 144650,
			votantes: 121516,
			participacionFuente: 84,
			participacion: 84.01,
			year: YEAR,
			indicator: INDICATOR,
			module: MODULE,
			key: "comuna-de-valdivia-plebiscito-constitucional-2023-17-de-diciembre-2023-biblioteca-congreso-nacional-valdivia-participacion-electoral"
		});
	});

	it("should generate unique keys for each territory", () => {
		const keys = runPipeline(sampleHtml).map(item => item.key);

		expect(new Set(keys).size).toBe(keys.length);
	});
});

describe("Participacion Electoral - Validación contra datos manuales", () => {
	it("should match the counts and percentages published by the source", () => {
		const [comuna, region, pais] = runPipeline(sampleHtml);

		expect([
			comuna.inscritos,
			comuna.votantes,
			comuna.participacionFuente
		]).toEqual([144650, 121516, 84]);
		expect([
			region.inscritos,
			region.votantes,
			region.participacionFuente
		]).toEqual([362741, 302498, 83.4]);
		expect([pais.inscritos, pais.votantes, pais.participacionFuente]).toEqual([
			15278800, 12984823, 85
		]);
	});

	it("should compute a participation that rounds to the published one", () => {
		for (const record of runPipeline(sampleHtml)) {
			expect(Math.round(record.participacion)).toBe(
				Math.round(record.participacionFuente)
			);
		}
	});
});
