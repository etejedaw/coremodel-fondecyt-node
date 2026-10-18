import { FetchAdapter } from "./FetchAdapter";
import { assertResponseOk, toFetchError } from "./fetch-errors";
import { writeFile } from "fs/promises";
import { basename } from "path";

export class DownloadAdapter implements FetchAdapter {
	async fetch(url: string): Promise<string> {
		try {
			const response = await fetch(url);
			assertResponseOk(url, response);

			const buffer = Buffer.from(await response.arrayBuffer());
			const fileName = basename(new URL(url).pathname) || `file-${Date.now()}`;
			const filePath = `/tmp/${fileName}`;

			await writeFile(filePath, buffer);

			return filePath;
		} catch (error) {
			throw toFetchError(url, error);
		}
	}
}
