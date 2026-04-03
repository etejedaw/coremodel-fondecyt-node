export abstract class CalculatorAdapter<
	Input = Record<string, any>,
	Output = Record<string, any>
> {
	abstract calculate(data: Input[]): Output;
}
