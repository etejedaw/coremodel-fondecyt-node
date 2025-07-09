import { HtmlExtractor } from "../../libs/htmlExtractor";
import { ObservatorioSocial as ObSo } from "../../libs/dataExtractor";
import * as path from "path";
import { deleteFile, downloadFile } from "../downloadFile.helpers";
import XLSX from "xlsx";

export class ObservatorioSocial {
	readonly #url: string[];
	readonly #extractor: HtmlExtractor;

	constructor(url: string[] | string, extractor: HtmlExtractor) {
		this.#url = this.#normalizeUrl(url);
		this.#extractor = extractor;
	}

	async init(code: string): Promise<any> {
		const data = await this.#getData(code);

		if (!data) return [];
		if (code.includes("prevision-social")) {
			return await this.#extractPrevisionSocial(data.link);
		}
	}

	async getAll(): Promise<any> {
		const observatorioSocial = this.#url.map(
			url => new ObSo(url, this.#extractor)
		);
		const promises = observatorioSocial.map(data => data.search());
		const data = await Promise.all(promises);
		return data.flat();
	}

	async #getData(code: string): Promise<any> {
		const observatorioSocial = new ObSo(this.#url[0], this.#extractor);
		return await observatorioSocial.getByCode(code);
	}

	#normalizeUrl(url: string[] | string): string[] {
		return typeof url === "string" ? [url] : url;
	}

	async #extractPrevisionSocial(url: string): Promise<any> {
		const fileName = `${this.#generateFileName()}.xlsx`;
		const destination = path.resolve(__dirname, "../../../tmp", fileName);
		await downloadFile(url, destination);

		const workbook = XLSX.readFile(destination);
		const page = "1";
		const sheet = workbook.Sheets[page];
		const data: any[][] = XLSX.utils.sheet_to_json(sheet, {
			header: 1,
			range: 4
		});
		const rawData = data
			.map(arr => arr.slice(1, 14))
			.filter(arr => arr.length !== 0);

		const [keys, ...values] = rawData;
		const result = values.map(value =>
			Object.fromEntries(keys.map((key, index) => [key, value[index]]))
		);

		deleteFile(destination);
		return {
			result,
			meta: {
				title:
					"Número y porcentaje de población en edad de trabajar (1990-2017)",
				detail: "ESTIMACIÓN"
			}
		};
	}

	#generateFileName(): string {
		const date = new Date();
		const timestamp = date.getTime();
		return String(timestamp);
	}
}
