import express, { Router } from "express";
import { AddressInfo } from "net";
import { Server } from "http";
import { errorHandler } from "../../../src/api/error-handler";

export interface TestServer {
	baseUrl: string;
	close: () => Promise<void>;
}

export async function startTestServer(
	path: string,
	router: Router
): Promise<TestServer> {
	const app = express();
	app.use(express.json());
	app.use(path, router);
	app.use(errorHandler);

	const server: Server = await new Promise(resolve => {
		const listening = app.listen(0, () => resolve(listening));
	});
	const { port } = server.address() as AddressInfo;

	return {
		baseUrl: `http://127.0.0.1:${port}${path}`,
		close: async () =>
			await new Promise<void>((resolve, reject) => {
				server.close(error => (error ? reject(error) : resolve()));
			})
	};
}
