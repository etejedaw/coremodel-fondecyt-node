import { normalizeRegion } from "../../../src/modules/emergencias-desastres/regions";

describe("normalizeRegion", () => {
	const cases: Array<[string, string]> = [
		["Arica", "Arica y Parinacota"],
		["Arica y Parinacota", "Arica y Parinacota"],
		["Tarapacá", "Tarapacá"],
		["Antofagasta", "Antofagasta"],
		["Atacama", "Atacama"],
		["Región de Coquimbo", "Coquimbo"],
		["Valparaíso- Provincia de San Antonio", "Valparaíso"],
		["Región Metropolitana", "Metropolitana"],
		["O'Higgins", "O'Higgins"],
		["O´Higgins", "O'Higgins"],
		["Maule", "Maule"],
		["Ñuble", "Ñuble"],
		["Biobío", "Biobío"],
		["La Araucanía", "La Araucanía"],
		["Lonquimay-Araucanía", "La Araucanía"],
		["Los Ríos", "Los Ríos"],
		["Los Lagos", "Los Lagos"],
		["Aysén", "Aysén"],
		["Aysén- Cochrane", "Aysén"],
		["Magallanes", "Magallanes"],
		["Magallanes y de la Antártica Chilena", "Magallanes"]
	];

	it.each(cases)("should normalize %s to %s", (raw, expected) => {
		expect(normalizeRegion(raw)).toBe(expected);
	});

	it("should map every observed spelling onto the sixteen official regions", () => {
		const canonical = new Set(cases.map(([, expected]) => expected));
		expect(canonical.size).toBe(16);
	});

	it("should keep an unrecognised territory instead of dropping it", () => {
		expect(normalizeRegion("Territorio Antártico")).toBe("Territorio Antártico");
	});
});
