import { mongo } from "mongoose";
import { StorageAdapter } from "../../../core/adapters/storage-adapter/StorageAdapter";
import { StorageError } from "../../../core/errors";
import { logger } from "../../../core/logger";
import { ParticipacionElectoral } from "./schema";

export class ParticipacionElectoralStorageAdapter extends StorageAdapter {
	async find(indicator: string) {
		try {
			return await ParticipacionElectoral.find(
				{ indicator },
				{ _id: 0, __v: 0 }
			).lean();
		} catch (error) {
			throw new StorageError("participacion-electoral find failed", {
				indicator,
				error: error instanceof Error ? error.message : String(error)
			});
		}
	}

	async save(data: Array<Record<string, unknown>>): Promise<void> {
		try {
			await ParticipacionElectoral.insertMany(data, { ordered: false });
		} catch (error) {
			if (error instanceof mongo.MongoError && error.code === 11000) {
				logger.warn(error.message, "Duplicate keys skipped");
				return;
			}
			throw new StorageError("participacion-electoral insertMany failed", {
				error: error instanceof Error ? error.message : String(error)
			});
		}
	}
}
