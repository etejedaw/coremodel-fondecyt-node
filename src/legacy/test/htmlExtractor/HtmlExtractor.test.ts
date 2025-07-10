import {
	RequestPromise,
	Puppeteer,
	Getter
} from "../../../../src/libs/htmlExtractor";

const url = "https://reactnativetutorial.net/css-selectors/";
const regex = /<html>(.*?)<\/html>/gs;

test("Request Promise should return an html page", async () => {
	const requestPromise = new RequestPromise();
	const getter = await Getter.build(url, requestPromise);
	const result = getter.html;
	expect(result).toMatch(regex);
});

test("Puppeteer Promise should return an html page", async () => {
	const puppeteer = new Puppeteer();
	const getter = await Getter.build(url, puppeteer);
	const result = getter.html;
	expect(result).toMatch(regex);
});
