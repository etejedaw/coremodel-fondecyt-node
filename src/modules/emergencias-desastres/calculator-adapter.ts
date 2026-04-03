import { CalculatorAdapter } from "../../core/adapters/calculator-adapter/CalculatorAdapter";

interface DrillRecord {
	date: Date;
	place: string;
	city: string;
}

interface DrillResult {
	totalDrills: number;
	drillsByCity: Record<string, number>;
}

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
}
