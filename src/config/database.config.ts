import mongoose from "mongoose";
import { environment } from "./environment.config";

export async function mongodb(): Promise<typeof mongoose> {
	const connectionString = `mongodb://${environment.DB_USERNAME}:${environment.DB_PASSWORD}@${environment.DB_HOST}:${environment.DB_PORT}`;
	mongoose.set("strictQuery", true);
	return await mongoose.connect(connectionString);
}
