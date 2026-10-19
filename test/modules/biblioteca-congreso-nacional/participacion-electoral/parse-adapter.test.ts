import { ParticipacionElectoralParseAdapter } from "../../../../src/modules/biblioteca-congreso-nacional/participacion-electoral/parse-adapter";

const adapter = new ParticipacionElectoralParseAdapter();

const html = `
<div class="z-depth-1">
  <h6>8.1 Padrón, votantes (n°) y participación (%), Elecciones generales 2025</h6>
  <table>
    <thead>
      <tr></tr>
      <tr><th>Unidad Territorial</th><th>Inscritos Total</th><th>Votación</th><th>Participación (%)</th></tr>
    </thead>
    <tr><td>Comuna de Valdivia</td><td>147.528</td><td>125.299</td><td>84,9</td></tr>
    <tr><td>Región de Los Ríos</td><td>370.100</td><td>313.194</td><td>84,6</td></tr>
  </table>
</div>
<div class="z-depth-1">
  <h6>8.2 Padrón, votantes (n°) y participación (%), 2da vuelta presidencial, 2025</h6>
  <table>
    <thead>
      <tr><th>Unidad Territorial</th><th>Inscritos Total</th><th>Votación</th><th>Participación (%)</th></tr>
    </thead>
    <tr><td>Comuna de Valdivia</td><td>147.528</td><td>124.968</td><td>84,7</td></tr>
  </table>
</div>
`;

describe("ParticipacionElectoralParseAdapter", () => {
	it("should extract one row per territory and participation table", () => {
		const result = adapter.extract(html);

		expect(result).toEqual([
			{
				eleccion: "Elecciones generales 2025",
				unidadTerritorial: "Comuna de Valdivia",
				inscritos: "147.528",
				votantes: "125.299",
				participacionFuente: "84,9"
			},
			{
				eleccion: "Elecciones generales 2025",
				unidadTerritorial: "Región de Los Ríos",
				inscritos: "370.100",
				votantes: "313.194",
				participacionFuente: "84,6"
			},
			{
				eleccion: "2da vuelta presidencial, 2025",
				unidadTerritorial: "Comuna de Valdivia",
				inscritos: "147.528",
				votantes: "124.968",
				participacionFuente: "84,7"
			}
		]);
	});

	it("should find the columns by header when the report adds or renames them", () => {
		const report2020 = `
<div class="z-depth-1">
  <h6>8.1 Electores habilitados, Votantes (n°) y Participación (%). Elecciones presidencial, parlamentarias y consejeros regionales, 19 Noviembre 2017</h6>
  <table>
    <tr><th>Nivel Territorial</th><th>Mesas Total</th><th>N° Electores</th><th>N° Votantes</th><th>Participación (%)</th></tr>
    <tr><td>	Valdivia	</td><td>350</td><td>132.345</td><td>65.169</td><td>49,240000000000002</td></tr>
  </table>
</div>
`;

		expect(adapter.extract(report2020)).toEqual([
			{
				eleccion:
					"Elecciones presidencial, parlamentarias y consejeros regionales, 19 Noviembre 2017",
				unidadTerritorial: "Valdivia",
				inscritos: "132.345",
				votantes: "65.169",
				participacionFuente: "49,240000000000002"
			}
		]);
	});

	it("should ignore tables whose heading is not about participation", () => {
		const resultsTable = `
<div class="z-depth-1">
  <h6>8.2 Resultado Plebiscito Constitucional 2023. Cantidad de votos</h6>
  <table>
    <tr><th>Unidad Territorial</th><th>A Favor</th><th>En Contra</th></tr>
    <tr><td>Comuna de Valdivia</td><td>46.236</td><td>69.427</td></tr>
  </table>
</div>
`;

		expect(adapter.extract(resultsTable)).toHaveLength(0);
	});

	it("should skip a participation table without the expected columns", () => {
		const withoutVoters = html.replace(/Votación/g, "Mesas");

		expect(adapter.extract(withoutVoters)).toHaveLength(0);
	});

	it("should return empty array when section not found", () => {
		expect(adapter.extract("<div>no data</div>")).toHaveLength(0);
	});
});
