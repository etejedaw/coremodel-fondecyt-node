export abstract class StorageAdapter {
	abstract save(data: Array<Record<string, unknown>>): Promise<void>;
	abstract find(indicator: string): Promise<Array<Record<string, unknown>>>;
}
