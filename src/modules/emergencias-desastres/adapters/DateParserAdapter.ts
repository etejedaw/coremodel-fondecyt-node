import cheerio from "cheerio";
import { ParseAdapter } from "../../../core/adapters/parse-adapter/ParseAdapter";

export class DateParserAdapter implements ParseAdapter {
	extract(data: string) {
		const $ = cheerio.load(data);
		return $(".back-fechas .item .card")
			.map((_idx, elem) => {
				const dateElem = $(elem).find(".caja-date");
				const date = {
					day: Number(
						$(dateElem).find(".dat_day").text().trim().split("\t")[0]
					),
					month: $(dateElem).find(".dat_mes").text().trim(),
					year: Number($(dateElem).find(".dat_year").text().trim())
				};
				const placeElem = $(elem).find(".card-body");
				const place = {
					type: $(placeElem).find(".card-title a").text().trim(),
					city: $(placeElem).find(".card-title.pb-3").text().trim()
				};
				return { date, place };
			})
			.get();
	}
}
