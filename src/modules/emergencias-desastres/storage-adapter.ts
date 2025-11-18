import { StorageAdapter } from "../../core/adapters/storage-adapter/StorageAdapter";
import { EmercenciaDesastres } from "./schema";
import { mongo } from "mongoose";

export class EmergenciasDesastresStorageAdapter implements StorageAdapter {
	async save(data: Array<Record<string, unknown>>): Promise<void> {
		try {
			await EmercenciaDesastres.insertMany(data, { ordered: false });
		} catch (error) {
			if (error instanceof mongo.MongoError && error.code === 11000) {
				console.log(error.message);
				return;
			}
			console.error(error);
			throw error;
		}
	}
}
