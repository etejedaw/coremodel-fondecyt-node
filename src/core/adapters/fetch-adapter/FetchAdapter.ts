export abstract class FetchAdapter {
	abstract fetch: (url: string) => Promise<string>;
}
