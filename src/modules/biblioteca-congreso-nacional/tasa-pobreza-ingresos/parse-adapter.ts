import * as cheerio from "cheerio";
import { ParseAdapter } from "../../../core/adapters/parse-adapter/ParseAdapter";
import { CasenField, Input } from "./interfaces";

const HEADER_ROWS = 2;
// Matches a measurement header such as "Casen 2017" or "CASEN 2022".
const CASEN_HEADER = /casen\s*(\d{4})/i;

export class TasaPobrezaIngresosParseAdapter implements ParseAdapter<Input[]> {
	extract(html: string): Input[] {
		const $ = cheerio.load(html);
		const section = $(
			'h6:contains("2.1 Tasa de Pobreza por ingresos")'
		).closest(".z-depth-1");
		if (!section.length) return [];

		const rows = section.find("table tr");
		const headerTexts = rows
			.slice(0, HEADER_ROWS)
			.find("th, td")
			.map((_idx, cell) => $(cell).text().trim())
			.get();
		const fields = toCasenFields(headerTexts);
		if (!fields.length) return [];

		const data: Input[] = [];
		rows.slice(HEADER_ROWS).each((_idx, row) => {
			const columns = $(row).find("td");
			if (columns.length < fields.length + 1) return;
			const measurements = Object.fromEntries(
				fields.map((field, index) => [
					field,
					$(columns[index + 1])
						.text()
						.trim()
				])
			);
			data.push({
				unidadTerritorial: $(columns[0]).text().trim(),
				...measurements
			} as Input);
		});
		return data;
	}
}

function toCasenFields(headerTexts: string[]): CasenField[] {
	return headerTexts.flatMap<CasenField>(text => {
		const match = CASEN_HEADER.exec(text);
		return match ? [`casen${match[1]}`] : [];
	});
}
