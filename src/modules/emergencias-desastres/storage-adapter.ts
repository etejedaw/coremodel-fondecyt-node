import { StorageAdapter } from "../../core/adapters/storage-adapter/StorageAdapter";
import { StorageError } from "../../core/errors";
import { logger } from "../../core/logger";
import { EmercenciaDesastres } from "./schema";
import { MongoBulkWriteError } from "mongodb";

export class EmergenciasDesastresStorageAdapter extends StorageAdapter {
	async find(indicator: string) {
		try {
			return await EmercenciaDesastres.find(
				{ indicator },
				{ _id: 0, __v: 0 }
			).lean();
		} catch (error) {
			throw new StorageError("emergencia-desastres find failed", {
				indicator,
				error: error instanceof Error ? error.message : String(error)
			});
		}
	}

	async save(data: Array<Record<string, unknown>>): Promise<void> {
		try {
			await EmercenciaDesastres.insertMany(data, { ordered: false });
		} catch (error) {
			if (error instanceof MongoBulkWriteError) {
				logger.warn(
					{ writeErrors: error.writeErrors },
					"Duplicate keys skipped"
				);
				return;
			}
			throw new StorageError("emergencia-desastres insertMany failed", {
				error: error instanceof Error ? error.message : String(error)
			});
		}
	}
}
