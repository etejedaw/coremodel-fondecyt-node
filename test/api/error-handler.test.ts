import { Request, Response, NextFunction } from "express";
import { errorHandler } from "../../src/api/error-handler";
import {
	CronExecutionError,
	FetchError,
	InvalidQueryParamError,
	ParseError,
	StorageError
} from "../../src/core/errors";
import { logger } from "../../src/core/logger";

function createResponse() {
	const res = {} as Response;
	res.status = jest.fn().mockReturnValue(res);
	res.json = jest.fn().mockReturnValue(res);
	return res;
}

function handle(error: Error) {
	const res = createResponse();
	errorHandler(error, {} as Request, res, jest.fn() as NextFunction);
	return res;
}

describe("errorHandler", () => {
	let logError: jest.SpyInstance;

	beforeEach(() => {
		logError = jest.spyOn(logger, "error").mockImplementation(() => undefined);
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it.each([
		[
			new ParseError("simulacros-2021", "https://example.org"),
			"Cannot extract data from source"
		],
		[
			new InvalidQueryParamError("year", "is required"),
			"year query param is required"
		]
	])("should respond 400 for domain errors (%s)", (error, message) => {
		const res = handle(error);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({ error: message });
	});

	it.each([
		[
			new FetchError("https://example.org", "HTTP 503"),
			"Fetch failed for https://example.org"
		],
		[
			new StorageError("emergencia-desastres insertMany failed"),
			"Storage failed: emergencia-desastres insertMany failed"
		],
		[
			new CronExecutionError("simulacros-2021", "boom"),
			"Cron execution failed for simulacros-2021"
		]
	])("should respond 502 for service errors (%s)", (error, message) => {
		const res = handle(error);

		expect(res.status).toHaveBeenCalledWith(502);
		expect(res.json).toHaveBeenCalledWith({ error: message });
	});

	it("should respond 500 without leaking the message for unexpected errors", () => {
		const res = handle(new Error("connection string leaked"));

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
	});

	it("should log the context of known errors", () => {
		handle(new FetchError("https://example.org", "HTTP 503"));

		expect(logError).toHaveBeenCalledWith(
			{ context: { url: "https://example.org", cause: "HTTP 503" } },
			"Fetch failed for https://example.org"
		);
	});

	it("should log unexpected errors as they are", () => {
		const error = new Error("boom");
		handle(error);

		expect(logError).toHaveBeenCalledWith(error);
	});
});
