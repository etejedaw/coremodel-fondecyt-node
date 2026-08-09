import { Schema, model } from "mongoose";

// `ScrapeBase.init` agrega `indicator` y `module` a cada registro antes de
// guardarlo. Al no estar declarados aqui, `strict: true` los descartaba en
// silencio y la coleccion quedaba sin forma de saber que indicador origino
// cada documento.
const EmergenciasDesastresSchema = new Schema(
	{
		key: { type: String, required: true, unique: true },
		date: { type: Date, required: true },
		place: { type: String, required: true },
		region: { type: String, required: true },
		regionSource: { type: String, required: true },
		indicator: { type: String, required: true },
		module: { type: String, required: true }
	},
	{ timestamps: true, strict: true }
);

export const EmercenciaDesastres = model(
	"emergencia-desastres",
	EmergenciasDesastresSchema
);
