import { ScrapeBase } from "../../core/ScrapeBase";
import { BIBLIOTECA_CONGRESO_NACIONAL_CONFIG } from "./Config";

export class BibliotecaCongresoNacionalScraper extends ScrapeBase {
	constructor() {
		super("biblioteca-congreso-nacional", BIBLIOTECA_CONGRESO_NACIONAL_CONFIG);
	}
}
