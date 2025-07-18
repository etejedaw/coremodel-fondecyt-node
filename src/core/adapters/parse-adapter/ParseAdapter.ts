export abstract class ParseAdapter<T = Array<Record<string, unknown>>> {
	abstract extract: (data: string) => T;
}
