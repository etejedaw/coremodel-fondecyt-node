import { FetchAdapter } from "./FetchAdapter";
import { assertResponseOk, toFetchError } from "./fetch-errors";

export class JsonFetchAdapter implements FetchAdapter {
	async fetch(url: string) {
		try {
			const response = await fetch(url);
			assertResponseOk(url, response);
			const data = await response.json();
			return JSON.stringify(data);
		} catch (error) {
			throw toFetchError(url, error);
		}
	}
}
