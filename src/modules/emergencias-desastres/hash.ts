import slug from "slug";
import {
	Base,
	HashAdapter
} from "../../core/adapters/hash-adapter/HashAdapter";
import { Output } from "./interfaces";

export class EmergenciaDesastresHashAdapter implements HashAdapter {
	generate(data: Output & Base): string {
		const date = data.date.toISOString().split("T")[0];
		const region = data.region;
		const concat = `${date}-${region}`;
		return slug(concat);
	}
}
