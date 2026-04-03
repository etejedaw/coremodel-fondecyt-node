import cheerio from "cheerio";
import { ParseAdapter } from "../../../core/adapters/parse-adapter/ParseAdapter";
import { Input } from "./interfaces";

export class TasaPobrezaIngresosParseAdapter implements ParseAdapter<Input[]> {
	extract(html: string): Input[] {
		const $ = cheerio.load(html);
		const data: Input[] = [];

		const section = $(
			'h6:contains("2.1 Tasa de Pobreza por ingresos")'
		).closest(".z-depth-1");

		if (section.length) {
			const rows = section.find("table tr").slice(2);

			rows.each((_idx, row) => {
				const columns = $(row).find("td");
				if (columns.length >= 3) {
					data.push({
						unidadTerritorial: $(columns[0]).text().trim(),
						casen2017: $(columns[1]).text().trim(),
						casen2022: $(columns[2]).text().trim()
					});
				}
			});
		}
		return data;
	}
}
