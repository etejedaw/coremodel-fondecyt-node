export abstract class MapperAdapter<
	Input = Record<string, any>,
	Output = Record<string, any>
> {
	abstract map(data: Input): Output;
}
