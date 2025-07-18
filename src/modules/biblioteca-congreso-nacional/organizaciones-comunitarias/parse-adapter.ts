import { ParseAdapter } from "../../../core/adapters/parse-adapter/ParseAdapter";

export class OrganizacionesComunitariasParseAdapter implements ParseAdapter {
	extract(data: string) {
		const json = JSON.parse(data) as Record<string, unknown>;
		return json.datosTemaN as Array<Record<string, unknown>>;
	}
}
