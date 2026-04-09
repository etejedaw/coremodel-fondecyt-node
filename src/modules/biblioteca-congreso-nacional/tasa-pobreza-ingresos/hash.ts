import slug from "slug";
import {
	Base,
	HashAdapter
} from "../../../core/adapters/hash-adapter/HashAdapter";
import { Output } from "./interfaces";

export class TasaPobrezaIngresosHashAdapter implements HashAdapter {
	generate(data: Output & Base): string {
		const concat = [data.unidadTerritorial, data.module, data.indicator].join(
			"-"
		);
		return slug(concat);
	}
}
