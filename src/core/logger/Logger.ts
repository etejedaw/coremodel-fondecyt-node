import pino from "pino";
import { environment } from "../../config/environment.config";

function buildTargets(): pino.TransportTargetOptions[] {
	const targets: pino.TransportTargetOptions[] = [
		{
			target: "pino/file",
			options: { destination: "logs/all.log", mkdir: true },
			level: "trace"
		},
		{
			target: "pino/file",
			options: { destination: "logs/errors.log", mkdir: true },
			level: "warn"
		}
	];

	if (environment.NODE_ENV === "dev") {
		targets.push({
			target: "pino-pretty",
			options: { colorize: true },
			level: "trace"
		});
	}

	return targets;
}

function createLogger() {
	const isDev = environment.NODE_ENV === "dev";

	return pino({
		level: isDev ? "trace" : "warn",
		base: { pid: undefined },
		transport: { targets: buildTargets() }
	});
}

export const logger = createLogger();
