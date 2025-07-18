export abstract class StorageAdapter {
	abstract save(data: Array<Record<string, unknown>>): Promise<void>;
}
