import { Request, Response, NextFunction } from "express";
import { BaseError, DomainError, ServiceError } from "../core/errors";
import { logger } from "../core/logger";

export function errorHandler(
	err: Error,
	_req: Request,
	res: Response,
	_next: NextFunction
) {
	if (err instanceof BaseError) {
		logger.error({ context: err.context }, err.message);
	} else {
		logger.error(err);
	}

	if (err instanceof DomainError) {
		return res.status(400).json({ error: err.message });
	}

	if (err instanceof ServiceError) {
		return res.status(502).json({ error: err.message });
	}

	return res.status(500).json({ error: "Internal server error" });
}
