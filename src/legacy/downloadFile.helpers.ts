import * as fs from "fs";
import { Readable } from "stream";
import { finished } from "stream/promises";

async function downloadFile(url: string, path: string): Promise<void> {
	try {
		const response = await fetch(url);
		const body = response.body;

		createTmpDirectory(path);
		const file = fs.createWriteStream(path, { flags: "w" });

		await finished(Readable.fromWeb(body as any).pipe(file));
		file.close();
	} catch (error) {
		console.log(error);
	}
}

function deleteFile(path: string): void {
	try {
		fs.unlinkSync(path);
	} catch (error) {
		console.log(error);
	}
}

function createTmpDirectory(directory: string): void {
	const arrayPath = directory.split("/");
	arrayPath.pop();
	const path = arrayPath.join("/");
	if (!fs.existsSync(path)) fs.mkdirSync(path);
}

export { downloadFile, deleteFile };
