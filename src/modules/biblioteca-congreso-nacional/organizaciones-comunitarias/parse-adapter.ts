import { ParseAdapter } from "../../../core/adapters/parse-adapter/ParseAdapter";
import { Input } from "./interfaces";

export class OrganizacionesComunitariasParseAdapter implements ParseAdapter<Input[]> {
	extract(data: string): Input[] {
		const json = JSON.parse(data) as Record<string, unknown>;
		return json.datosTemaN as Input[];
	}
}
