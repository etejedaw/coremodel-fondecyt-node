import { environment } from "./config/environment.config";
import { mongodb } from "./config/database.config";
import { server } from "./api/server";
import { ScraperFactory } from "./core/ScraperFactory";
import { EmergenciaDesastresScraper } from "./modules/emergencias-desastres";
import { BibliotecaCongresoNacionalScraper } from "./modules/biblioteca-congreso-nacional";

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
