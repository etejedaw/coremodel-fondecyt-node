import { Request, Response, NextFunction } from "express";
import { BaseError } from "../core/errors";
import { logger } from "../core/logger";

export function errorHandler(
	err: Error,
	_req: Request,
	res: Response,
	_next: NextFunction
) {
	if (err instanceof BaseError) {
		logger.error({ context: err.context }, err.message);
		return res.status(400).json({ error: err.message });
	}

	logger.error(err);
	return res.status(500).json({ error: "Internal server error" });
}
