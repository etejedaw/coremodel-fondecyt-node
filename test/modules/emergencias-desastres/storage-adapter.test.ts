import { EmergenciasDesastresStorageAdapter } from "../../../src/modules/emergencias-desastres/storage-adapter";
import { EmercenciaDesastres } from "../../../src/modules/emergencias-desastres/schema";
import { StorageError } from "../../../src/core/errors";

describe("EmergenciasDesastresStorageAdapter.find", () => {
	const adapter = new EmergenciasDesastresStorageAdapter();

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it("should filter by indicator and hide internal Mongo fields", async () => {
		const records = [{ key: "2021-05-27-arica-y-parinacota" }];
		const lean = jest.fn().mockResolvedValue(records);
		const find = jest
			.spyOn(EmercenciaDesastres, "find")
			.mockReturnValue({ lean } as never);

		await expect(adapter.find("simulacros-2021")).resolves.toBe(records);
		expect(find).toHaveBeenCalledWith(
			{ indicator: "simulacros-2021" },
			{ _id: 0, __v: 0 }
		);
	});

	it("should wrap read failures in StorageError", async () => {
		const lean = jest.fn().mockRejectedValue(new Error("buffering timed out"));
		jest.spyOn(EmercenciaDesastres, "find").mockReturnValue({ lean } as never);

		await expect(adapter.find("simulacros-2021")).rejects.toMatchObject({
			constructor: StorageError,
			message: "Storage failed: emergencia-desastres find failed",
			context: { indicator: "simulacros-2021", error: "buffering timed out" }
		});
	});
});
