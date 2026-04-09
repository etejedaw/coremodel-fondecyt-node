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
		const latest = await DrillResultModel.findOne({ indicator, module })
			.sort({ createdAt: -1 })
			.lean();

		if (latest && JSON.stringify(latest.totalDrills) === JSON.stringify(result.totalDrills) &&
			JSON.stringify(latest.drillsByCity) === JSON.stringify(result.drillsByCity)) {
			logger.info(`Calculator result unchanged for ${module}:${indicator}`);
			return;
		}

		await DrillResultModel.create({ ...result, indicator, module });
		logger.info(`Calculator result saved for ${module}:${indicator}`);
	}

	async find(indicator: string, module: string): Promise<DrillResult | null> {
		return await DrillResultModel.findOne(
			{ indicator, module },
			{ _id: 0, __v: 0, createdAt: 0, updatedAt: 0 }
		)
			.sort({ createdAt: -1 })
			.lean();
	}
}
