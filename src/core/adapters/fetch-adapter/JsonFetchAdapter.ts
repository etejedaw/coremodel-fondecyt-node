import { FetchAdapter } from "./FetchAdapter";

export class JsonFetchAdapter implements FetchAdapter {
	async fetch(url: string) {
		const response = await fetch(url);
		const data = await response.json();
		return JSON.stringify(data);
	}
}
