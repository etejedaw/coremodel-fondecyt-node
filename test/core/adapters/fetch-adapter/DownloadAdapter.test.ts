import { writeFile } from "fs/promises";
import { DownloadAdapter } from "../../../../src/core/adapters/fetch-adapter/DownloadAdapter";
import { FetchError } from "../../../../src/core/errors";

jest.mock("fs/promises", () => ({ writeFile: jest.fn() }));

const URL = "https://example.org/files/datos.xlsx";
const mockedWriteFile = writeFile as jest.MockedFunction<typeof writeFile>;

describe("DownloadAdapter", () => {
	const adapter = new DownloadAdapter();

	beforeEach(() => {
		mockedWriteFile.mockResolvedValue(undefined);
	});

	afterEach(() => {
		jest.restoreAllMocks();
		mockedWriteFile.mockReset();
	});

	it("should save the file and return its path", async () => {
		jest.spyOn(global, "fetch").mockResolvedValue(new Response("a,b"));

		await expect(adapter.fetch(URL)).resolves.toBe("/tmp/datos.xlsx");
		expect(mockedWriteFile).toHaveBeenCalledWith(
			"/tmp/datos.xlsx",
			Buffer.from("a,b")
		);
	});

	it("should throw FetchError without writing when the response is not successful", async () => {
		jest
			.spyOn(global, "fetch")
			.mockResolvedValue(new Response("", { status: 500 }));

		await expect(adapter.fetch(URL)).rejects.toMatchObject({
			constructor: FetchError,
			context: { url: URL, cause: "HTTP 500" }
		});
		expect(mockedWriteFile).not.toHaveBeenCalled();
	});

	it("should throw FetchError when the request fails", async () => {
		jest
			.spyOn(global, "fetch")
			.mockRejectedValue(new TypeError("fetch failed"));

		await expect(adapter.fetch(URL)).rejects.toBeInstanceOf(FetchError);
	});

	it("should throw FetchError when the file cannot be written", async () => {
		jest.spyOn(global, "fetch").mockResolvedValue(new Response("a,b"));
		mockedWriteFile.mockRejectedValue(new Error("EACCES"));

		await expect(adapter.fetch(URL)).rejects.toMatchObject({
			constructor: FetchError,
			context: { url: URL, cause: "EACCES" }
		});
	});
});
