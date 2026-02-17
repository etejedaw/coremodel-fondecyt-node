import { mongo } from "mongoose";
import { StorageAdapter } from "../../../core/adapters/storage-adapter/StorageAdapter";
import { StorageError } from "../../../core/errors";
import { logger } from "../../../core/logger";
import { OrganizacionesComunitarias } from "./schema";

export class OrganizacionesComunitariasStorageAdapter
	implements StorageAdapter
{
	async save(data: Array<Record<string, unknown>>): Promise<void> {
		try {
			await OrganizacionesComunitarias.insertMany(data, { ordered: false });
		} catch (error) {
			if (error instanceof mongo.MongoError && error.code === 11000) {
				logger.warn(error.message, "Duplicate keys skipped");
				return;
			}
			throw new StorageError(
				"organizaciones-comunitarias insertMany failed",
				{
					error:
						error instanceof Error ? error.message : String(error)
				}
			);
		}
	}
}
