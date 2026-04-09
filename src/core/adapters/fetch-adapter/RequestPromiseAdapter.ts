import request from "request-promise";
import { FetchAdapter } from "./FetchAdapter";

export class RequestPromiseAdapter implements FetchAdapter {
	async fetch(url: string): Promise<string> {
		return await request.get(url);
	}
}
