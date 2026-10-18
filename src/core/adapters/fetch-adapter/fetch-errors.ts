import { FetchError } from "../../errors";

export function toFetchError(url: string, error: unknown): FetchError {
	return error instanceof FetchError ? error : new FetchError(url, error);
}

export function assertResponseOk(url: string, response: Response) {
	if (!response.ok) throw new FetchError(url, `HTTP ${response.status}`);
}
