export interface Input {
	date: DateInput;
	place: PlaceInput;
}

interface DateInput {
	day: number;
	month: string;
	year: number;
}

interface PlaceInput {
	type: string;
	region: string;
}

export interface Output {
	date: Date;
	place: string;
	region: string;
	regionSource: string;
}
