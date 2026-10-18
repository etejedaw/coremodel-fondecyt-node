import request from "request-promise";
import { FetchAdapter } from "./FetchAdapter";
import { toFetchError } from "./fetch-errors";

export class RequestPromiseAdapter implements FetchAdapter {
	async fetch(url: string): Promise<string> {
		try {
			return await request.get(url);
		} catch (error) {
			throw toFetchError(url, error);
		}
	}
}
