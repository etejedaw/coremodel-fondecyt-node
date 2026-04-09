import { BaseError } from "./BaseError";

export class DomainError extends BaseError {}

export class AdapterNotFoundError extends DomainError {
	constructor(adapterType: string, indicator?: string) {
		super(`${adapterType} not found`, { adapterType, indicator });
	}
}

export class ScraperNotFoundError extends DomainError {
	constructor(module: string) {
		super(`Scraper ${module} not found`, { module });
	}
}

export class ScraperAlreadyRegisteredError extends DomainError {
	constructor(module: string) {
		super(`Scraper ${module} is already registered`, { module });
	}
}

export class ParseError extends DomainError {
	constructor(indicator: string, url: string) {
		super("Cannot extract data from source", { indicator, url });
	}
}
