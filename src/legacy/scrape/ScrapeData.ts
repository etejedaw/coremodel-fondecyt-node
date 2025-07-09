import { Output } from "../../libs/dataExtractor";

export interface ScrapeData<dataType> {
	data: dataType[];
	output: Output;
}
