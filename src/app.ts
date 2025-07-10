import { environment } from "./config/environment";
import { mongodb } from "./config/database";
import { server } from "./api/server";
import { ScraperFactory } from "./core/ScraperFactory";
import { EmergenciaDesastresScraper } from "./modules/emergencias-desastres/EmergenciaDesastreScraper";
import { BibliotecaCongresoNacionalScraper } from "./modules/biblioteca-congreso-nacional/BibliotecaCongresaNacionalScraper";

async function main() {
	const scraperFactory = ScraperFactory.getInstance();

	scraperFactory.register(new EmergenciaDesastresScraper());
	scraperFactory.register(new BibliotecaCongresoNacionalScraper());

	server(environment.PORT);
	console.log(`Server connected on port ${environment.PORT}`);

	await mongodb();
	console.log(`Database connected on port ${environment.DB_PORT}`);
}

void main();
