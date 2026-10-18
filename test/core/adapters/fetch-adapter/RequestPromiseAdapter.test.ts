import request from "request-promise";
import { RequestPromiseAdapter } from "../../../../src/core/adapters/fetch-adapter/RequestPromiseAdapter";
import { FetchError } from "../../../../src/core/errors";

jest.mock("request-promise", () => ({ get: jest.fn() }));

const URL = "https://emergenciaydesastres.mineduc.cl/simulacros-2021/";
const mockedGet = request.get as unknown as jest.Mock;

describe("RequestPromiseAdapter", () => {
	const adapter = new RequestPromiseAdapter();

	afterEach(() => {
		mockedGet.mockReset();
	});

	it("should return the response body", async () => {
		mockedGet.mockResolvedValue("<html></html>");

		await expect(adapter.fetch(URL)).resolves.toBe("<html></html>");
		expect(mockedGet).toHaveBeenCalledWith(URL);
	});

	it("should throw FetchError when the request fails", async () => {
		mockedGet.mockRejectedValue(new Error("404 - Not Found"));

		const result = adapter.fetch(URL);

		await expect(result).rejects.toBeInstanceOf(FetchError);
		await expect(result).rejects.toMatchObject({
			message: `Fetch failed for ${URL}`,
			context: { url: URL, cause: "404 - Not Found" }
		});
	});
});
