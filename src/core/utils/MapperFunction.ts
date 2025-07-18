export type MapperFunction<
	Input = Record<string, unknown>,
	Output = Record<string, unknown>
> = (data: Input) => Output;
