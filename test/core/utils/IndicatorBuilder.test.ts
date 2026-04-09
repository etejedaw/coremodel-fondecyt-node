import { IndicatorBuilder } from "../../../src/core/IndicatorBuilder";
import { FetchAdapter } from "../../../src/core/adapters/fetch-adapter/FetchAdapter";
import { ParseAdapter } from "../../../src/core/adapters/parse-adapter/ParseAdapter";
import { FREQUENCIES } from "../../../src/core/enums/Frequencies";
import { z } from "zod";

class MockFetchAdapter implements FetchAdapter {
	fetch = jest.fn();
}

class MockParseAdapter implements ParseAdapter {
	extract = jest.fn();
}

describe("Every Indicator Builder instance", () => {
	let builder: IndicatorBuilder;
	const mockFetch = new MockFetchAdapter();
	const mockParse = new MockParseAdapter();

	beforeEach(() => {
		builder = new IndicatorBuilder();
	});

	it("should create an valid indicator with all the required fields", () => {
		const expected = {
			name: "Test Indicator",
			url: "https://example.com",
			frequency: FREQUENCIES.daily,
			fetchAdapter: mockFetch,
			parseAdapter: mockParse
		};

		const actual = builder
			.setName("Test Indicator")
			.setUrl("https://example.com")
			.setFrequency(FREQUENCIES.daily)
			.setFetchAdapter(mockFetch)
			.setParseAdapter(mockParse)
			.build();

		expect(expected).toEqual(actual);
	});

	it("should throw an error if name is missing", () => {
		expect(() =>
			builder
				.setUrl("https://example.com")
				.setFrequency(FREQUENCIES.daily)
				.setFetchAdapter(mockFetch)
				.setParseAdapter(mockParse)
				.build()
		).toThrow(z.ZodError);
	});

	it("should allow optional description", () => {
		const indicator = builder
			.setName("Test")
			.setUrl("https://example.com")
			.setFrequency(FREQUENCIES.weekly)
			.setFetchAdapter(mockFetch)
			.setParseAdapter(mockParse)
			.build();

		expect(indicator.description).toBeUndefined();

		const withDescription = builder
			.setDescription("Descripción de prueba")
			.build();

		expect(withDescription.description).toBe("Descripción de prueba");
	});

	it("should throw an error if url is missing", () => {
		expect(() =>
			builder
				.setName("Test")
				.setFrequency(FREQUENCIES.monthly)
				.setFetchAdapter(mockFetch)
				.setParseAdapter(mockParse)
				.build()
		).toThrow(z.ZodError);
	});

	it("should throw an error if url is not valid", () => {
		expect(() =>
			builder
				.setName("Test")
				.setUrl("url-invalida")
				.setFrequency(FREQUENCIES.year)
				.build()
		).toThrow(z.ZodError);
	});
});
