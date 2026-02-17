import { StorageAdapter } from "../../core/adapters/storage-adapter/StorageAdapter";
import { StorageError } from "../../core/errors";
import { EmercenciaDesastres } from "./schema";
import { MongoBulkWriteError } from "mongodb";

export class EmergenciasDesastresStorageAdapter implements StorageAdapter {
	async save(data: Array<Record<string, unknown>>): Promise<void> {
		try {
			await EmercenciaDesastres.insertMany(data, { ordered: false });
		} catch (error) {
			if (error instanceof MongoBulkWriteError) {
				console.warn(error.writeErrors);
				return;
			}
			throw new StorageError("emergencia-desastres insertMany failed", {
				error: error instanceof Error ? error.message : String(error)
			});
		}
	}
}
