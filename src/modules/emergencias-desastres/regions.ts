import { logger } from "../../core/logger";

/**
 * La fuente del MINEDUC nombra el territorio de cada simulacro sin ninguna
 * convencion: la misma region aparece como "Aysen" o "Aysen- Cochrane", y
 * "O'Higgins" convive con "O´Higgins" (apostrofo tipografico contra acento
 * agudo). Sin normalizar, dos grafias de la misma region se cuentan como dos
 * territorios distintos al agregar los resultados.
 *
 * Cada patron se busca como subcadena del texto sin diacriticos ni mayusculas,
 * de modo que los sufijos y prefijos que agrega la fuente ("Region de",
 * "- Provincia de San Antonio") no impidan la coincidencia.
 */
const REGION_PATTERNS: ReadonlyArray<readonly [string, string]> = [
	["arica", "Arica y Parinacota"],
	["tarapaca", "Tarapacá"],
	["antofagasta", "Antofagasta"],
	["atacama", "Atacama"],
	["coquimbo", "Coquimbo"],
	["valparaiso", "Valparaíso"],
	["metropolitana", "Metropolitana"],
	["higgins", "O'Higgins"],
	["maule", "Maule"],
	["nuble", "Ñuble"],
	["biobio", "Biobío"],
	["araucania", "La Araucanía"],
	["los rios", "Los Ríos"],
	["los lagos", "Los Lagos"],
	["aysen", "Aysén"],
	["magallanes", "Magallanes"]
];

function fold(value: string): string {
	return value
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/[^a-z\s]/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

/**
 * Devuelve el nombre canonico de la region. Si el texto no coincide con
 * ninguna de las dieciseis regiones, se conserva tal cual y se registra el
 * caso: perder el dato original seria peor que arrastrar una grafia sin
 * normalizar, y el log permite detectar que la fuente introdujo un territorio
 * nuevo o cambio su forma de nombrarlos.
 */
export function normalizeRegion(raw: string): string {
	const folded = fold(raw);
	const match = REGION_PATTERNS.find(([pattern]) => folded.includes(pattern));

	if (!match) {
		logger.warn({ raw }, "Region without a canonical match, kept as-is");
		return raw.trim();
	}

	return match[1];
}
