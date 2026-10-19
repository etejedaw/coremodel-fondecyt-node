import { ParticipacionElectoral } from "../../../../src/modules/biblioteca-congreso-nacional/participacion-electoral/schema";

describe("ParticipacionElectoral schema", () => {
	it("should store records in the participacion-electoral collection", () => {
		expect(ParticipacionElectoral.collection.collectionName).toBe(
			"participacion-electoral"
		);
	});
});
