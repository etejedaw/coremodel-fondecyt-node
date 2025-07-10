import { ParseAdapter } from "../../../core/adapters/parse-adapter/ParseAdapter";

export class OrganizacionesComunitarias implements ParseAdapter {
	extract(data: string) {
		const json = JSON.parse(data) as Record<string, unknown>;
		return json.datosTemaN;
	}
}
