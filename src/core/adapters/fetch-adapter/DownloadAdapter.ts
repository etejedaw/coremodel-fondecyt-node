import { FetchAdapter } from "./FetchAdapter";
import { writeFile } from "fs/promises";
import { basename } from "path";

export class DownloadAdapter implements FetchAdapter {
	async fetch(url: string): Promise<string> {
		const res = await fetch(url);

		const buffer = Buffer.from(await res.arrayBuffer());
		const fileName = basename(new URL(url).pathname) || `file-${Date.now()}`;
		const filePath = `/tmp/${fileName}`;

		await writeFile(filePath, buffer);

		return filePath;
	}
}
