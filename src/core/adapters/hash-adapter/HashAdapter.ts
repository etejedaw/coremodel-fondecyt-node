export abstract class HashAdapter<Output = Record<string, any>> {
	abstract generate(data: Output & Base): string;
}

export interface Base {
	indicator: string;
	module: string;
}
