import { model, Schema } from "mongoose";

const ParticipacionElectoralSchema = new Schema(
	{
		key: { type: String, required: true, unique: true },
		year: { type: String, required: true },
		eleccion: { type: String, required: true },
		unidadTerritorial: { type: String, required: true },
		inscritos: { type: Number, required: true },
		votantes: { type: Number, required: true },
		participacionFuente: { type: Number, required: true },
		participacion: { type: Number, required: true }
	},
	{ timestamps: true, strict: false }
);

const COLLECTION = "participacion-electoral";

export const ParticipacionElectoral = model(
	COLLECTION,
	ParticipacionElectoralSchema,
	COLLECTION
);
