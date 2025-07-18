import { StorageAdapter } from "../../../core/adapters/storage-adapter/StorageAdapter";
import { OrganizacionesComunitarias } from "../OrganizacionesComunitarias";

export class OrganizacionesComunitariasStorageAdapter
	implements StorageAdapter
{
	async save(data: Array<Record<string, unknown>>): Promise<void> {
		await OrganizacionesComunitarias.insertMany(data);
	}
}
