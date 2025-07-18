import express from "express";
import morgan from "morgan";
import router from "./routes";

import { environment } from "../config/environment.config";

export function server(port: number): void {
	const nodeEnv = environment.NODE_ENV;

	const app = express();

	app.use(morgan(nodeEnv));
	app.use(express.json());
	app.use(router);

	app.listen(port);
}
