import {
	RequestPromise,
	Puppeteer,
	Getter
} from "../../../../src/libs/htmlExtractor";

const regex = /<html>(.*?)<\/html>/gs;

describe("Using Getter class with RequestPromise injection", () => {
	const requestPromise = new RequestPromise();
	test("If the page exists, should return the html", async () => {
		const url = "https://reactnativetutorial.net/css-selectors/";
		const getter = await Getter.build(url, requestPromise);
		const result = getter.html;
		expect(result).toMatch(regex);
	});
	test("If the page does not exists, should return undefined", async () => {
		const url = "";
		const getter = await Getter.build(url, requestPromise);
		const result = getter.html;
		expect(result).toBeUndefined();
	});
});

describe("Using Getter class with Puppeteer injection", () => {
	const puppeteer = new Puppeteer();
	test("If the page exists, should return the html", async () => {
		const url = "https://reactnativetutorial.net/css-selectors/";
		const getter = await Getter.build(url, puppeteer);
		const result = getter.html;
		expect(result).toMatch(regex);
	});
	test("If the page does not exists, should return undefined", async () => {
		const url = "";
		const getter = await Getter.build(url, puppeteer);
		const result = getter.html;
		expect(result).toBeUndefined();
	});
});
