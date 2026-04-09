export abstract class ParseAdapter<T = any[]> {
	abstract extract: (data: string) => T;
}
