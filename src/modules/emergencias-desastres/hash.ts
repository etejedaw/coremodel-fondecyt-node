import slug from "slug";
import {
	Base,
	HashAdapter
} from "../../core/adapters/hash-adapter/HashAdapter";
import { Output } from "./interfaces";

export class EmergenciaDesastresHashAdapter implements HashAdapter {
	generate(data: Output & Base): string {
		const date = data.date.toISOString().split("T")[0];
		const city = data.city;
		const concat = `${date}-${city}`;
		return slug(concat);
	}
}
