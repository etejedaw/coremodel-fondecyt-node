import crypto from "crypto";
import {
	Base,
	HashAdapter
} from "../../../core/adapters/hash-adapter/HashAdapter";
import { Output } from "./interfaces";

export class OrganizacionesComunitariasHashAdapter implements HashAdapter {
	generate(data: Output & Base): string {
		const concat = [data.anio, data.indicator, data.module].join("|");
		const hashBuffer = crypto.createHash("md5").update(concat).digest();
		const hashInteger = hashBuffer.readUInt32BE(0);
		return hashInteger.toString(36).padStart(7, "0");
	}
}
