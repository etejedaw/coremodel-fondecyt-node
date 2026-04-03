import { TasaPobrezaIngresosParseAdapter } from "../../../../src/modules/biblioteca-congreso-nacional/tasa-pobreza-ingresos/parse-adapter";

const adapter = new TasaPobrezaIngresosParseAdapter();

const html = `
<div class="z-depth-1">
  <h6>2.1 Tasa de Pobreza por ingresos</h6>
  <table>
    <tr><th>Unidad</th><th>CASEN 2017</th><th>CASEN 2022</th></tr>
    <tr><td>Encabezado</td><td>%</td><td>%</td></tr>
    <tr><td>Valdivia</td><td>12,5</td><td>10,3</td></tr>
    <tr><td>Región de los Ríos</td><td>15,1</td><td>13,7</td></tr>
  </table>
</div>
`;

describe("TasaPobrezaIngresosParseAdapter", () => {
	it("should extract rows from the poverty table", () => {
		const result = adapter.extract(html);

		expect(result).toHaveLength(2);
		expect(result[0]).toEqual({
			unidadTerritorial: "Valdivia",
			casen2017: "12,5",
			casen2022: "10,3"
		});
		expect(result[1]).toEqual({
			unidadTerritorial: "Región de los Ríos",
			casen2017: "15,1",
			casen2022: "13,7"
		});
	});

	it("should return empty array when section not found", () => {
		const result = adapter.extract("<div>no data</div>");
		expect(result).toHaveLength(0);
	});
});
