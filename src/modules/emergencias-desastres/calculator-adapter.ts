import { Schema, model } from "mongoose";
import { CalculatorAdapter } from "../../core/adapters/calculator-adapter/CalculatorAdapter";
import { logger } from "../../core/logger";

interface DrillRecord {
	date: Date;
	place: string;
	city: string;
}

interface DrillResult {
	totalDrills: number;
	drillsByCity: Record<string, number>;
}

const DrillResultSchema = new Schema(
	{
		key: { type: String, required: true, unique: true },
		indicator: { type: String, required: true },
		module: { type: String, required: true },
		totalDrills: { type: Number, required: true },
		drillsByCity: { type: Schema.Types.Mixed, required: true }
	},
	{ timestamps: true, strict: true }
);

const DrillResultModel = model("indicator-result", DrillResultSchema);

export class TsunamiDrillsCalculatorAdapter extends CalculatorAdapter<
	DrillRecord,
	DrillResult
> {
	calculate(data: DrillRecord[]): DrillResult {
		const drillsByCity = data.reduce<Record<string, number>>((acc, record) => {
			acc[record.city] = (acc[record.city] ?? 0) + 1;
			return acc;
		}, {});

		return {
			totalDrills: data.length,
			drillsByCity
		};
	}

	async save(
		result: DrillResult,
		indicator: string,
		module: string
	): Promise<void> {
		const key = `${module}:${indicator}`;
		await DrillResultModel.findOneAndUpdate(
			{ key },
			{ ...result, indicator, module, key },
			{ upsert: true }
		);
		logger.info(`Calculator result saved for ${key}`);
	}

	async find(indicator: string, module: string): Promise<DrillResult | null> {
		const key = `${module}:${indicator}`;
		return await DrillResultModel.findOne(
			{ key },
			{ _id: 0, __v: 0, key: 0, createdAt: 0, updatedAt: 0 }
		).lean();
	}
}
