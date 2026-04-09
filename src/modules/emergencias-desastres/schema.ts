import { Schema, model } from "mongoose";

const EmergenciasDesastresSchema = new Schema(
	{
		key: { type: String, required: true, unique: true },
		date: { type: Date, required: true },
		place: { type: String, required: true },
		city: { type: String, required: true }
	},
	{ timestamps: true, strict: true }
);

export const EmercenciaDesastres = model(
	"emergencia-desastres",
	EmergenciasDesastresSchema
);
