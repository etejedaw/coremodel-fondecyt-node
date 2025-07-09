import { HtmlExtractor } from "../../libs/htmlExtractor";
import { Output } from "../../libs/dataExtractor";

export abstract class ScrapeBase<ScrapeData> {
	readonly #url: string[];
	readonly #extractor: HtmlExtractor;

	protected constructor(url: string[] | string, extractor: HtmlExtractor) {
		this.#url = this.#toArray(url);
		this.#extractor = extractor;
	}

	abstract init(code?: string): ArrayData<ScrapeData>;
	abstract getData(): Promise<Output[]>;
	abstract scrape(output: Output): Data<ScrapeData>;

	async innerInit(): ArrayData<ScrapeData> {
		const data = await this.getData();
		if (data.length === 0) this.errorEmptyUrl();
		const promises = data.map(data => this.scrape(data));
		const extractData = await Promise.all(promises);
		const dataFiltered = extractData.filter(Boolean);
		if (dataFiltered.length === 0) this.errorEmptyExtract();
		return dataFiltered;
	}

	#toArray(url: string[] | string): string[] {
		return Array.isArray(url) ? url : [url];
	}

	errorEmptyUrl(): never {
		throw new Error("Data not found in URLs");
	}

	errorEmptyExtract(): never {
		throw new Error("No data available to extract");
	}

	errorEmptyCode(): never {
		throw new Error("Code not found in init function");
	}

	get url(): string[] {
		return this.#url;
	}

	get extractor(): HtmlExtractor {
		return this.#extractor;
	}
}

export type Data<ScrapeData> = Promise<ReturnData<ScrapeData>>;
export type ArrayData<ScrapeData> = Promise<Array<ReturnData<ScrapeData>>>;

export interface ReturnData<ScrapeData> {
	scrape?: ScrapeData[];
	metadata: Output;
}
