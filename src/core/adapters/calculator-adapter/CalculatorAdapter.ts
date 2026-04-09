export abstract class CalculatorAdapter<
	Input = Record<string, any>,
	Output = Record<string, any>
> {
	abstract calculate(data: Input[]): Output;
	abstract save(result: Output, indicator: string, module: string): Promise<void>;
	abstract find(indicator: string, module: string): Promise<Output | null>;
}
