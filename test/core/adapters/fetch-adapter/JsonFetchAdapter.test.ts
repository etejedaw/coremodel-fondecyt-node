import { JsonFetchAdapter } from "../../../../src/core/adapters/fetch-adapter/JsonFetchAdapter";
import { FetchError } from "../../../../src/core/errors";

const URL = "https://www.bcn.cl/siit/datos.json";

describe("JsonFetchAdapter", () => {
	const adapter = new JsonFetchAdapter();

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it("should return the JSON body serialized as a string", async () => {
		jest
			.spyOn(global, "fetch")
			.mockResolvedValue(new Response(JSON.stringify([{ anio: 2020 }])));

		await expect(adapter.fetch(URL)).resolves.toBe('[{"anio":2020}]');
	});

	it("should throw FetchError when the response is not successful", async () => {
		jest
			.spyOn(global, "fetch")
			.mockResolvedValue(new Response("Not Found", { status: 404 }));

		const result = adapter.fetch(URL);

		await expect(result).rejects.toBeInstanceOf(FetchError);
		await expect(result).rejects.toMatchObject({
			message: `Fetch failed for ${URL}`,
			context: { url: URL, cause: "HTTP 404" }
		});
	});

	it("should throw FetchError when the request fails", async () => {
		jest
			.spyOn(global, "fetch")
			.mockRejectedValue(new TypeError("fetch failed"));

		await expect(adapter.fetch(URL)).rejects.toMatchObject({
			constructor: FetchError,
			context: { url: URL, cause: "fetch failed" }
		});
	});

	it("should throw FetchError when the body is not valid JSON", async () => {
		jest.spyOn(global, "fetch").mockResolvedValue(new Response("<html>"));

		await expect(adapter.fetch(URL)).rejects.toBeInstanceOf(FetchError);
	});
});
