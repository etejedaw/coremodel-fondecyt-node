import { mongo } from "mongoose";
import { ParticipacionElectoralStorageAdapter } from "../../../../src/modules/biblioteca-congreso-nacional/participacion-electoral/storage-adapter";
import { ParticipacionElectoral } from "../../../../src/modules/biblioteca-congreso-nacional/participacion-electoral/schema";
import { StorageError } from "../../../../src/core/errors";
import { logger } from "../../../../src/core/logger";

const INDICATOR = "valdivia-participacion-electoral";

describe("ParticipacionElectoralStorageAdapter.find", () => {
	const adapter = new ParticipacionElectoralStorageAdapter();

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it("should filter by indicator and hide internal Mongo fields", async () => {
		const records = [{ key: "comuna-de-valdivia-elecciones-generales-2025" }];
		const lean = jest.fn().mockResolvedValue(records);
		const find = jest
			.spyOn(ParticipacionElectoral, "find")
			.mockReturnValue({ lean } as never);

		await expect(adapter.find(INDICATOR)).resolves.toBe(records);
		expect(find).toHaveBeenCalledWith(
			{ indicator: INDICATOR },
			{ _id: 0, __v: 0 }
		);
	});

	it("should wrap read failures in StorageError", async () => {
		const lean = jest.fn().mockRejectedValue(new Error("buffering timed out"));
		jest
			.spyOn(ParticipacionElectoral, "find")
			.mockReturnValue({ lean } as never);

		await expect(adapter.find(INDICATOR)).rejects.toMatchObject({
			constructor: StorageError,
			message: "Storage failed: participacion-electoral find failed",
			context: { indicator: INDICATOR, error: "buffering timed out" }
		});
	});
});

describe("ParticipacionElectoralStorageAdapter.save", () => {
	const adapter = new ParticipacionElectoralStorageAdapter();
	const records = [{ key: "comuna-de-valdivia-elecciones-generales-2025" }];

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it("should insert without stopping at the first duplicate", async () => {
		const insertMany = jest
			.spyOn(ParticipacionElectoral, "insertMany")
			.mockResolvedValue([] as never);

		await adapter.save(records);

		expect(insertMany).toHaveBeenCalledWith(records, { ordered: false });
	});

	it("should skip duplicate keys without throwing", async () => {
		const duplicate = new mongo.MongoError("E11000 duplicate key error");
		duplicate.code = 11000;
		jest
			.spyOn(ParticipacionElectoral, "insertMany")
			.mockRejectedValue(duplicate);
		const warn = jest.spyOn(logger, "warn").mockImplementation(() => undefined);

		await expect(adapter.save(records)).resolves.toBeUndefined();
		expect(warn).toHaveBeenCalled();
	});

	it("should wrap other write failures in StorageError", async () => {
		jest
			.spyOn(ParticipacionElectoral, "insertMany")
			.mockRejectedValue(new Error("connection lost"));

		await expect(adapter.save(records)).rejects.toMatchObject({
			constructor: StorageError,
			message: "Storage failed: participacion-electoral insertMany failed",
			context: { error: "connection lost" }
		});
	});
});
