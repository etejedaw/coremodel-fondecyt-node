import { model, Schema } from "mongoose";

const OrganizacionesComunitariasSchema = new Schema(
	{
		key: { type: String, required: true, unique: true },
		nDeCentrosDeMadres: { type: Number, required: true },
		nDeOtrasOrganizacionesComunitariasFuncionalesOtros: {
			type: Number,
			required: true
		},
		nDeCentrosDePadresYApoderados: { type: Number, required: true },
		nDeUnionesComunales: { type: Number, required: true },
		nDeJuntasDeVecinos: { type: Number, required: true },
		nCentrosCulturales: { type: Number, required: true },
		nDeOrganizacionesComunitariasSumaTotal: { type: Number, required: true },
		nDeClubesDeportivos: { type: Number, required: true },
		nDeCentrosUOrganizacionesDelAdultoMayor: { type: Number, required: true },
		nDeCompaniasDeBomberos: { type: Number, required: true },
		anio: { type: Number, required: true }
	},
	{ timestamps: true, strict: false }
);

export const OrganizacionesComunitarias = model(
	"organizaciones-comunitarias",
	OrganizacionesComunitariasSchema
);
