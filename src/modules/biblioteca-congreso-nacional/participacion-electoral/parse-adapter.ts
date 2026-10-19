import * as cheerio from "cheerio";
import { ParseAdapter } from "../../../core/adapters/parse-adapter/ParseAdapter";
import { Input } from "./interfaces";

const PARTICIPATION_HEADING = /participaci[oó]n\s*\(%\)/i;
// Strips a section number such as "8.1 " from the start of a heading.
const SECTION_NUMBER = /^\d+(\.\d+)*\s+/;
// Captures what follows "participación (%)" in a heading, e.g. ". Plebiscito Constitucional 2022".
const ELECTION_AFTER_HEADING = /participaci[oó]n\s*\(%\)\s*[.,]?\s*(.*)$/i;

type Column = Exclude<keyof Input, "eleccion">;

const COLUMN_HEADERS: Array<[Column, RegExp]> = [
	["unidadTerritorial", /territorial/i],
	["inscritos", /inscritos|electores|padr[oó]n/i],
	["votantes", /votaci[oó]n|votantes/i],
	["participacionFuente", /participaci[oó]n/i]
];

export class ParticipacionElectoralParseAdapter
	implements ParseAdapter<Input[]>
{
	extract(html: string): Input[] {
		const $ = cheerio.load(html);
		const data: Input[] = [];

		$("h6").each((_idx, heading) => {
			const title = $(heading).text().trim();
			if (!PARTICIPATION_HEADING.test(title)) return;

			const eleccion = toElectionName(title);
			const table = $(heading).nextAll("table").first();
			const headerTexts = table
				.find("th")
				.map((_index, cell) => $(cell).text().trim())
				.get();
			const columnIndexes = toColumnIndexes(headerTexts);
			if (!columnIndexes) return;

			table.find("tr").each((_index, row) => {
				const cells = $(row).find("td");
				if (cells.length !== headerTexts.length) return;
				const values = Object.fromEntries(
					Object.entries(columnIndexes).map(([column, index]) => [
						column,
						$(cells[index]).text().trim()
					])
				) as Record<Column, string>;
				data.push({ eleccion, ...values });
			});
		});

		return data;
	}
}

function toElectionName(title: string): string {
	const withoutNumber = title.replace(SECTION_NUMBER, "");
	const match = ELECTION_AFTER_HEADING.exec(withoutNumber);
	return (match?.[1] ?? withoutNumber).trim();
}

function toColumnIndexes(headerTexts: string[]): Record<Column, number> | null {
	const indexes: Partial<Record<Column, number>> = {};
	for (const [column, pattern] of COLUMN_HEADERS) {
		const index = headerTexts.findIndex(
			(text, position) =>
				pattern.test(text) && !Object.values(indexes).includes(position)
		);
		if (index === -1) return null;
		indexes[column] = index;
	}
	return indexes as Record<Column, number>;
}
