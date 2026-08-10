import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const MB_URL = process.env.MB_URL ?? "http://localhost:3001";
const ADMIN = {
	email: process.env.MB_ADMIN_EMAIL ?? "admin@fondecyt.local",
	password: process.env.MB_ADMIN_PASSWORD ?? "Fondecyt2026!",
	firstName: process.env.MB_ADMIN_FIRST_NAME ?? "Admin",
	lastName: process.env.MB_ADMIN_LAST_NAME ?? "FONDECYT"
};
const SITE_NAME = "FONDECYT CORE";

const configPath = join(
	dirname(fileURLToPath(import.meta.url)),
	"provisioning.json"
);
const config = JSON.parse(await readFile(configPath, "utf8"));

let sessionToken = "";

async function api(method, path, body) {
	const response = await fetch(`${MB_URL}${path}`, {
		method,
		headers: {
			"Content-Type": "application/json",
			...(sessionToken ? { "X-Metabase-Session": sessionToken } : {})
		},
		...(body === undefined ? {} : { body: JSON.stringify(body) })
	});

	const text = await response.text();
	if (!response.ok) {
		throw new Error(
			`${method} ${path} -> ${response.status}: ${text.slice(0, 500)}`
		);
	}
	return text ? JSON.parse(text) : null;
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function waitForMetabase() {
	for (let attempt = 0; attempt < 60; attempt++) {
		try {
			const health = await api("GET", "/api/health");
			if (health?.status === "ok") return;
		} catch {
			// Metabase todavia esta iniciando.
		}
		await sleep(5000);
	}
	throw new Error(`Metabase no respondio en ${MB_URL}`);
}

async function authenticate() {
	const properties = await api("GET", "/api/session/properties");

	if (properties["has-user-setup"]) {
		const session = await api("POST", "/api/session", {
			username: ADMIN.email,
			password: ADMIN.password
		});
		sessionToken = session.id;
		console.log("Sesion iniciada con la cuenta existente.");
		return;
	}

	const session = await api("POST", "/api/setup", {
		token: properties["setup-token"],
		user: {
			first_name: ADMIN.firstName,
			last_name: ADMIN.lastName,
			email: ADMIN.email,
			password: ADMIN.password,
			site_name: SITE_NAME
		},
		prefs: { site_name: SITE_NAME, site_locale: "es", allow_tracking: false }
	});
	sessionToken = session.id;
	console.log(`Instancia configurada. Administrador: ${ADMIN.email}`);
}

/**
 * Metabase incluye una base de datos de ejemplo y un dashboard de muestra al
 * instalarse. Se eliminan para que la instancia contenga unicamente los
 * indicadores del proyecto.
 */
async function removeSampleContent() {
	const { data: databases } = await api("GET", "/api/database");
	const sample = databases.find(database => database.is_sample);
	if (sample) {
		await api("DELETE", `/api/database/${sample.id}`);
		console.log("Base de datos de ejemplo eliminada.");
	}

	const dashboards = await api("GET", "/api/dashboard");
	for (const dashboard of dashboards) {
		if (dashboard.name === config.dashboard.name) continue;
		await api("PUT", `/api/dashboard/${dashboard.id}`, { archived: true });
		console.log(`Dashboard de ejemplo archivado: ${dashboard.name}`);
	}
}

async function ensureDatabase() {
	const { data: databases } = await api("GET", "/api/database");
	const existing = databases.find(
		database => database.name === config.database.name
	);
	if (existing) {
		console.log(
			`Base de datos "${existing.name}" ya conectada (id ${existing.id}).`
		);
		return existing.id;
	}

	let lastError;
	for (let attempt = 1; attempt <= 5; attempt++) {
		try {
			const created = await api("POST", "/api/database", config.database);
			console.log(
				`Base de datos "${created.name}" conectada (id ${created.id}).`
			);
			return created.id;
		} catch (error) {
			lastError = error;
			console.log(
				`No se pudo conectar "${config.database.name}" (intento ${attempt}/5), reintentando...`
			);
			await sleep(5000);
		}
	}
	throw lastError;
}

async function waitForTables(databaseId) {
	await api("POST", `/api/database/${databaseId}/sync_schema`);
	for (let attempt = 0; attempt < 30; attempt++) {
		const metadata = await api("GET", `/api/database/${databaseId}/metadata`);
		if (metadata.tables?.length) return;
		await sleep(2000);
	}
	console.warn(
		"Advertencia: Metabase no detecto colecciones en MongoDB, probablemente porque aun no se ejecuta ninguna extraccion. " +
			"Las questions y el dashboard se crean igual y mostraran datos cuando los extractores pueblen la base."
	);
}

async function ensureCards(databaseId) {
	const existingCards = await api("GET", "/api/card");
	const cards = [];

	for (const card of config.cards) {
		const payload = {
			name: card.name,
			description: card.description,
			display: card.display,
			visualization_settings: card.visualization_settings,
			dataset_query: {
				database: databaseId,
				type: "native",
				native: {
					query: JSON.stringify(card.query, null, 2),
					collection: card.collection
				}
			}
		};

		const existing = existingCards.find(item => item.name === card.name);
		const saved = existing
			? await api("PUT", `/api/card/${existing.id}`, payload)
			: await api("POST", "/api/card", payload);

		console.log(
			`Question ${existing ? "actualizada" : "creada"}: ${card.name}`
		);
		cards.push({ ...card, id: saved.id });
	}

	return cards;
}

async function ensureDashboard(cards) {
	const dashboards = await api("GET", "/api/dashboard");
	const existing = dashboards.find(
		dashboard => dashboard.name === config.dashboard.name
	);

	const dashboard =
		existing ?? (await api("POST", "/api/dashboard", config.dashboard));

	const dashcards = cards.map((card, index) => ({
		id: -(index + 1),
		card_id: card.id,
		col: card.layout.col,
		row: card.layout.row,
		size_x: card.layout.size_x,
		size_y: card.layout.size_y,
		visualization_settings: card.visualization_settings,
		parameter_mappings: []
	}));

	await api("PUT", `/api/dashboard/${dashboard.id}`, { dashcards });
	console.log(
		`Dashboard ${existing ? "actualizado" : "creado"}: ${dashboard.name}`
	);
	return dashboard.id;
}

await waitForMetabase();
await authenticate();
await removeSampleContent();
const databaseId = await ensureDatabase();
await waitForTables(databaseId);
const cards = await ensureCards(databaseId);
const dashboardId = await ensureDashboard(cards);
console.log(`\nListo: ${MB_URL}/dashboard/${dashboardId}`);
