import slug from "slug";
import {
	Base,
	HashAdapter
} from "../../../core/adapters/hash-adapter/HashAdapter";
import { OutputWithYear } from "./interfaces";

export class TasaPobrezaIngresosHashAdapter implements HashAdapter {
	generate(data: OutputWithYear & Base): string {
		const concat = [
			data.unidadTerritorial,
			data.year,
			data.module,
			data.indicator
		].join("-");
		return slug(concat);
	}
}
