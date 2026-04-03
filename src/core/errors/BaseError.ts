export abstract class BaseError extends Error {
	readonly context?: Record<string, unknown>;

	constructor(message: string, context?: Record<string, unknown>) {
		super(message);
		this.name = this.constructor.name;
		this.context = context;
	}
}
