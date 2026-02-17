import { BaseError } from "./BaseError";

export class ServiceError extends BaseError {}

export class StorageError extends ServiceError {
	constructor(message: string, context?: Record<string, unknown>) {
		super(`Storage failed: ${message}`, context);
	}
}

export class FetchError extends ServiceError {
	constructor(url: string, cause?: string) {
		super(`Fetch failed for ${url}`, { url, cause });
	}
}

export class CronExecutionError extends ServiceError {
	constructor(indicator: string, cause?: unknown) {
		super(`Cron execution failed for ${indicator}`, {
			indicator,
			cause: cause instanceof Error ? cause.message : String(cause)
		});
	}
}
