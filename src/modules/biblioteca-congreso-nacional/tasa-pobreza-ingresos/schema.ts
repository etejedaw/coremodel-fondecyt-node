import { model, Schema } from "mongoose";

const TasaPobrezaIngresosSchema = new Schema(
	{
		unidadTerritorial: { type: String, required: true },
		casen2017: { type: Number, required: true },
		casen2022: { type: Number, required: true }
	},
	{ timestamps: true, strict: false }
);

export const TasaPobrezaIngresos = model(
	"tasa-pobreza-ingresos",
	TasaPobrezaIngresosSchema
);
