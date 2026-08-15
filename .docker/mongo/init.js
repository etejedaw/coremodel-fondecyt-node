const database = db.getSiblingDB("test");

["emergencia-desastres", "tasa-pobreza-ingresos", "organizaciones-comunitarias", "indicator-results"].forEach(
	name => database.createCollection(name)
);
