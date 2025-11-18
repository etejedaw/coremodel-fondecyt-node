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
	city: string;
}

export interface Output {
	date: Date;
	place: string;
	city: string;
}
