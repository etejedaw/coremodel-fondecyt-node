import { z } from "zod";

const Environment = z
	.object({
		PORT: z.string().default("3000").transform(Number),
		DB_HOST: z.string().default("127.0.0.1"),
		DB_PORT: z.string().default("27017").transform(Number),
		DB_USERNAME: z.string().default("root"),
		DB_PASSWORD: z.string().default("toor"),
		NODE_ENV: z.string().default("dev")
	})
	.readonly();

export const environment = Environment.parse(process.env);
