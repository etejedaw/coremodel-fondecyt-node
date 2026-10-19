import slug from "slug";
import {
	Base,
	HashAdapter
} from "../../../core/adapters/hash-adapter/HashAdapter";
import { Output } from "./interfaces";

export class ParticipacionElectoralHashAdapter implements HashAdapter {
	generate(data: Output & Base): string {
		const concat = [
			data.unidadTerritorial,
			data.eleccion,
			data.module,
			data.indicator
		].join("-");
		return slug(concat);
	}
}
