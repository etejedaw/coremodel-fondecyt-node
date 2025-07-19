import { StorageAdapter } from "../../../core/adapters/storage-adapter/StorageAdapter";
import { TasaPobrezaIngresos } from "./schema";

export class TasaPobrezaIngresosStorageAdapter implements StorageAdapter {
	async save(data: Array<Record<string, unknown>>): Promise<void> {
		await TasaPobrezaIngresos.insertMany(data);
	}
}
