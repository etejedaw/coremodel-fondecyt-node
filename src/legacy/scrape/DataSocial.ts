import { Getter, HtmlExtractor } from "../../libs/htmlExtractor";
import { DataSocial as DS, Output } from "../../libs/dataExtractor";
import { ArrayData, Data, ScrapeBase } from "./ScrapeBase";

export class DataSocial extends ScrapeBase<DataType> {
	constructor(url: string[] | string, extractor: HtmlExtractor) {
		super(url, extractor);
	}

	async init(): ArrayData<DataType> {
		return await this.innerInit();
	}

	async getData(): Promise<Output[]> {
		const dataSocial = this.url.map(url => new DS(url, this.extractor));
		const promises = dataSocial.map(data => data.search());
		const data = await Promise.all(promises);
		return data.flat().filter(Boolean);
	}

	async scrape(output: Output): Data<DataType> {
		// TODO: Esta sección debe ser implementada nuevamente, una vez que el
		//  scrape sea actualizado

		const getter = await Getter.build(output.link, this.extractor);

		const html = getter.html;
		if (!html) return { metadata: output };

		return {
			scrape: [],
			metadata: output
		};
	}
}

interface DataType {
	message: string;
}
