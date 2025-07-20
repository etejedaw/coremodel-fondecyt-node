import { mongo } from "mongoose";
import { StorageAdapter } from "../../../core/adapters/storage-adapter/StorageAdapter";
import { TasaPobrezaIngresos } from "./schema";

export class TasaPobrezaIngresosStorageAdapter implements StorageAdapter {
	async save(data: Array<Record<string, unknown>>): Promise<void> {
		try {
			await TasaPobrezaIngresos.insertMany(data, { ordered: false });
		} catch (error) {
			if (error instanceof mongo.MongoError && error.code === 11000) {
				console.log(error.message);
				return;
			}
			throw error;
		}
	}
}
